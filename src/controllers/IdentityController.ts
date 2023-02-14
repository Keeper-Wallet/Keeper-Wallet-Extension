import {
  base58Encode,
  base64Decode,
  base64Encode,
  createPrivateKey,
  createPublicKey,
  decryptSeed,
  encryptSeed,
  generateRandomSeed,
  signBytes,
  utf8Decode,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import {
  AuthenticationDetails,
  type ChallengeName,
  type CognitoIdToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type ICognitoStorage,
} from 'amazon-cognito-identity-js';
import { type NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import invariant from 'tiny-invariant';

import { handleResponse } from '../_core/handleResponse';
import { DEFAULT_IDENTITY_CONFIG } from '../constants';
import {
  type ExtensionStorage,
  type StorageLocalState,
  type StorageSessionState,
} from '../storage/storage';
import { type NetworkController } from './network';
import { type PreferencesController } from './preferences';
import { type RemoteConfigController } from './remoteConfig';

export type CodeDelivery = {
  type: 'SMS' | 'EMAIL' | string;
  destination: string;
};

function startsWith(source: string, target: string, flags = 'i'): boolean {
  return !!source.match(new RegExp(`^${target}`, flags));
}

const fetch = globalThis.fetch;
globalThis.fetch = (endpoint: RequestInfo | URL, options?: RequestInit) => {
  if (
    typeof endpoint === 'string' &&
    (startsWith(endpoint, DEFAULT_IDENTITY_CONFIG.mainnet.cognito.endpoint) ||
      startsWith(endpoint, DEFAULT_IDENTITY_CONFIG.testnet.cognito.endpoint))
  ) {
    return fetch(endpoint, {
      ...options,
      headers: { ...options?.headers, 'X-Application': 'waveskeeper' },
    }).then(async response => {
      if (response.status === 403) {
        const err = await response.json();
        if ('type' in err && 'message' in err) {
          err.__type = err.type;
        }
        response.json = async () => err;
      }
      return response;
    });
  }

  return fetch(endpoint, options);
};

export type MFAType = 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';

export type IdentityUser = {
  address: string;
  publicKey: string;
  uuid: string; // cognito user identifier
  username: string; // wx email
};

export type IdentityConfig = {
  apiUrl: string;
  cognito: {
    userPoolId: string;
    clientId: string;
    endpoint: string;
  };
};

type IdentityState = Pick<StorageLocalState, 'cognitoSessions'>;

class IdentityStorage
  extends ObservableStore<IdentityState>
  implements ICognitoStorage
{
  private memo: Record<string, string | null> | undefined = {};
  private password: string | null | undefined;
  private _setSession: (session: Record<string, unknown>) => void;

  constructor(
    initState: IdentityState,
    initSession: StorageSessionState,
    setSession: (session: Record<string, unknown>) => void
  ) {
    super(initState);

    this.memo = initSession.memo;
    this.password = initSession.password;
    this._setSession = setSession;
  }

  lock() {
    this._setPassword(null);
  }

  unlock(password: string) {
    this._setPassword(password);
  }

  getItem(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.memo![key];
  }

  removeItem(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    delete this.memo![key];
    this._updateMemo();
  }

  setItem(key: string, value: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.memo![key] = value;
    this._updateMemo();
  }

  clear() {
    this.memo = {};
    this._updateMemo();
  }

  purge() {
    this.updateState({ cognitoSessions: undefined });
    this.clear();
  }

  async restore(userId: string) {
    const cognitoSessions = await this.decrypt();
    this.memo = cognitoSessions[userId] || {};
    this._updateMemo();
  }

  async persist(userId: string) {
    const cognitoSessions = await this.decrypt();
    cognitoSessions[userId] = this.memo;
    this.updateState({ cognitoSessions: await this.encrypt(cognitoSessions) });
  }

  async update(password: string) {
    const cognitoSessions = await this.decrypt();
    this._setPassword(password);
    this.updateState({ cognitoSessions: await this.encrypt(cognitoSessions) });
  }

  private _updateMemo() {
    this._setSession({ memo: this.memo });
  }

  private _setPassword(password?: string | null) {
    this.password = password;
    this._setSession({ password });
  }

  private async encrypt(object: CognitoSessions) {
    invariant(this.password);

    const encrypted = await encryptSeed(
      utf8Encode(JSON.stringify(object)),
      utf8Encode(this.password)
    );

    return base64Encode(encrypted);
  }

  private async decrypt() {
    const encryptedText = this.getState().cognitoSessions;

    try {
      if (!encryptedText) {
        return {};
      }

      const decryptedJson = await decryptSeed(
        base64Decode(encryptedText),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        utf8Encode(this.password!)
      );

      return JSON.parse(utf8Decode(decryptedJson)) as CognitoSessions;
    } catch (e) {
      throw new Error('Invalid password');
    }
  }
}

export interface IdentityApi {
  signBytes: (bytes: Uint8Array) => Promise<string>;
}

type CognitoSessions = Partial<Record<string, Record<string, string | null>>>;

export class IdentityController implements IdentityApi {
  protected getNetwork;
  protected getSelectedAccount;
  protected getIdentityConfig;
  private network: NetworkName | undefined;
  // identity properties
  private readonly seed = generateRandomSeed();
  private userPool: CognitoUserPool | undefined = undefined;
  private user: CognitoUser | undefined = undefined;
  private userData: { username: string; password: string } | undefined =
    undefined;
  private identity: IdentityUser | undefined = undefined;
  private store;

  constructor({
    extensionStorage,
    getNetwork,
    getSelectedAccount,
    getIdentityConfig,
  }: {
    extensionStorage: ExtensionStorage;
    getNetwork: NetworkController['getNetwork'];
    getSelectedAccount: PreferencesController['getSelectedAccount'];
    getIdentityConfig: RemoteConfigController['getIdentityConfig'];
  }) {
    this.store = new IdentityStorage(
      extensionStorage.getInitState({ cognitoSessions: undefined }),
      extensionStorage.getInitSession(),
      extensionStorage.setSession.bind(extensionStorage)
    );
    extensionStorage.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.getSelectedAccount = getSelectedAccount;
    this.getIdentityConfig = getIdentityConfig;

    this.configure();
  }

  initVault(password: string) {
    this.store.unlock(password);
  }

  async updateVault(oldPassword: string, newPassword: string) {
    this.unlock(oldPassword);
    await this.store.update(newPassword);
  }

  deleteVault() {
    this.clearSession();
    this.store.purge();
  }

  lock() {
    this.store.lock();
  }

  unlock(password: string) {
    this.store.unlock(password);
  }

  getConfig(): IdentityConfig {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.getIdentityConfig(this.network!);
  }

  configure() {
    const currentNetwork = this.getNetwork();
    this.store.clear();

    if (this.network !== currentNetwork) {
      this.network = currentNetwork;

      const config = this.getIdentityConfig(currentNetwork);
      this.userPool = new CognitoUserPool({
        UserPoolId: config.cognito.userPoolId,
        ClientId: config.cognito.clientId,
        Storage: this.store,
        endpoint: config.cognito.endpoint,
      });
    }
  }

  async getKeyPair() {
    const privateKey = await createPrivateKey(utf8Encode(this.seed));
    const publicKey = await createPublicKey(privateKey);

    return {
      privateKey,
      publicKey,
    };
  }

  async signIn(username: string, password: string) {
    this.clearSession();

    const { publicKey } = await this.getKeyPair();

    return new Promise<{ challengeName?: ChallengeName }>((resolve, reject) => {
      if (!this.userPool) {
        return reject(new Error('No UserPool'));
      }

      this.user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
        Storage: this.store,
      });

      this.userData = { username, password };

      this.user.authenticateUser(
        new AuthenticationDetails({
          Username: username,
          Password: password,
          ClientMetadata: {
            'custom:encryptionKey': base58Encode(publicKey),
          },
        }),
        {
          onSuccess: async () => {
            this.identity = await this.fetchIdentityUser();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.identity.uuid = this.user!.getUsername();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.identity.username = this.userData!.username;
            this.user = undefined;
            this.userData = undefined;

            resolve({});
          },

          onFailure: err => {
            reject(err);
          },
          customChallenge() {
            resolve({ challengeName: 'CUSTOM_CHALLENGE' });
          },
          mfaRequired(challengeName) {
            resolve({ challengeName });
          },
          mfaSetup(challengeName) {
            resolve({ challengeName });
          },
          newPasswordRequired() {
            resolve({ challengeName: 'NEW_PASSWORD_REQUIRED' });
          },
          totpRequired(challengeName) {
            resolve({ challengeName });
          },
          selectMFAType(challengeName) {
            resolve({ challengeName });
          },
        }
      );
    });
  }

  async confirmSignIn(
    code: string,
    mfaType: MFAType = 'SOFTWARE_TOKEN_MFA'
  ): Promise<void> {
    const { publicKey } = await this.getKeyPair();

    return new Promise((resolve, reject) => {
      if (!this.user) {
        return reject(new Error('Not authenticated'));
      }

      this.user.sendMFACode(
        code,
        {
          onSuccess: async session => {
            if (this.user) {
              delete this.user.challengeName;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              delete (this.user as any).challengeParam;
            }

            if (session && !this.identity) {
              this.identity = await this.fetchIdentityUser();
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              this.identity.uuid = this.user!.getUsername();
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              this.identity.username = this.userData!.username;
              this.user = undefined;
              this.userData = undefined;

              resolve();
            }
          },
          onFailure: err => {
            reject(err);
          },
        },
        mfaType,
        {
          'custom:encryptionKey': base58Encode(publicKey),
        }
      );
    });
  }

  private async fetchIdentityUser(): Promise<IdentityUser> {
    const token = this.getIdToken().getJwtToken();
    const cfg = this.getConfig();
    return fetch(`${cfg.apiUrl}/v1/user`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then(response => response.json());
  }

  getIdentityUser() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.identity!;
  }

  async persistSession(uuid: string) {
    await this.store.persist(this.getUserId(uuid));
  }

  async updateSession() {
    const selectedAccount = this.getSelectedAccount();

    if (selectedAccount?.type !== 'wx') {
      throw new Error('selectedAccount is not a wx account');
    }

    await this.persistSession(selectedAccount.uuid);
    this.clearSession();
  }

  async restoreSession(uuid: string) {
    this.clearSession();
    // set current user session
    await this.store.restore(this.getUserId(uuid));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.user = this.userPool!.getCurrentUser()!;
    // restores user session tokens from storage
    return new Promise((resolve, reject) => {
      if (!this.user) {
        return reject(new Error('Not authenticated'));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.user.getSession((err: any) => {
        if (err) {
          return reject(err);
        }

        this.refreshSessionIsNeeded()
          .then(async data => {
            await this.persistSession(uuid);
            resolve(data);
          })
          // eslint-disable-next-line @typescript-eslint/no-shadow
          .catch(err => reject(err));
      });
    });
  }

  private async refreshSessionIsNeeded() {
    const token = this.getIdToken();
    const payload = token.decodePayload();
    const currentTime = Math.ceil(Date.now() / 1000);
    const { publicKey } = await this.getKeyPair();
    const isValidTime = payload.exp - currentTime > 10;
    const isValidPublicKey =
      payload['custom:encryptionKey'] === base58Encode(publicKey);

    if (isValidPublicKey && isValidTime) {
      return Promise.resolve();
    }

    return this.refreshSession();
  }

  private async refreshSession() {
    const { publicKey } = await this.getKeyPair();
    const publicKeyBase58 = base58Encode(publicKey);
    const meta = { 'custom:encryptionKey': publicKeyBase58 };

    return new Promise<unknown>((resolve, reject) => {
      if (!this.user) {
        return reject(new Error('Not authenticated'));
      }

      this.user.updateAttributes(
        [
          new CognitoUserAttribute({
            Name: 'custom:encryptionKey',
            Value: publicKeyBase58,
          }),
        ],
        err => {
          if (err) {
            return reject(err);
          }

          if (!this.user) {
            return reject(new Error('Not authenticated'));
          }

          const session = this.user.getSignInUserSession();

          if (!session) {
            return reject(new Error('Not authenticated'));
          }

          const refreshToken = session.getRefreshToken();

          this.user.refreshSession(
            refreshToken,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve(data);
            },
            meta
          );
        },
        meta
      );
    });
  }

  clearSession() {
    this.user = undefined;
    this.userData = undefined;
    this.identity = undefined;
    this.store.clear();
  }

  async removeSession(uuid: string) {
    this.clearSession();
    await this.persistSession(uuid);
  }

  async signBytes(bytes: Uint8Array): Promise<string> {
    const selectedAccount = this.getSelectedAccount();

    if (selectedAccount?.type !== 'wx') {
      throw new Error('selectedAccount is not a wx account');
    }

    const userId = selectedAccount.uuid;

    const [{ privateKey }] = await Promise.all([
      this.getKeyPair(),
      this.restoreSession(userId),
    ]);

    const signature = await signBytes(privateKey, bytes);

    const response = await this.signByIdentity({
      payload: base64Encode(bytes),
      signature: base64Encode(signature),
    });

    this.clearSession();

    return base58Encode(base64Decode(response.signature));
  }

  private async signByIdentity(body: {
    payload: string;
    signature: string;
  }): Promise<{
    signature: string;
  }> {
    const token = this.getIdToken().getJwtToken();
    const cfg = this.getConfig();
    return fetch(`${cfg.apiUrl}/v1/sign`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then(handleResponse<{ signature: string }>);
  }

  private getIdToken(): CognitoIdToken {
    if (!this.user) {
      throw new Error('Not authenticated');
    }

    const session = this.user.getSignInUserSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    return session.getIdToken();
  }

  private getUserId(uuid: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const clientId = this.userPool!.getClientId();
    return `${clientId}.${uuid}`;
  }
}
