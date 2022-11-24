import { libs, seedUtils } from '@waves/waves-transactions';
import {
  AuthenticationDetails,
  CognitoIdToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ICognitoStorage,
} from 'amazon-cognito-identity-js';
import { NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';

import { DEFAULT_IDENTITY_CONFIG } from '../constants';
import {
  ExtensionStorage,
  StorageLocalState,
  StorageSessionState,
} from '../storage/storage';
import { NetworkController } from './network';
import { PreferencesController } from './preferences';
import { RemoteConfigController } from './remoteConfig';

export type CodeDelivery = {
  type: 'SMS' | 'EMAIL' | string;
  destination: string;
};

function startsWith(source: string, target: string, flags = 'i'): boolean {
  return !!source.match(new RegExp(`^${target}`, flags));
}

const fetch = global.fetch;
global.fetch = (
  endpoint: RequestInfo | URL,
  { headers = {}, ...options }: RequestInit = {}
) => {
  if (
    typeof endpoint === 'string' &&
    (startsWith(endpoint, DEFAULT_IDENTITY_CONFIG.mainnet.cognito.endpoint) ||
      startsWith(endpoint, DEFAULT_IDENTITY_CONFIG.testnet.cognito.endpoint))
  ) {
    return fetch(endpoint, {
      ...options,
      headers: { ...headers, 'X-Application': 'waveskeeper' },
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

  return fetch(endpoint, { headers, ...options });
};

export type MFAType = 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';

export type AuthChallenge =
  | 'SMS_MFA'
  | 'SOFTWARE_TOKEN_MFA'
  | 'NEW_PASSWORD_REQUIRED'
  | 'MFA_SETUP'
  | 'CUSTOM_CHALLENGE';

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

  restore(userId: string) {
    const cognitoSessions = this.decrypt() as Record<
      string,
      Record<string, string>
    >;
    this.memo = cognitoSessions[userId] || {};
    this._updateMemo();
  }

  persist(userId: string) {
    const cognitoSessions = this.decrypt();
    cognitoSessions[userId] = this.memo;
    this.updateState({
      cognitoSessions: this.encrypt(cognitoSessions),
    });
  }

  update(password: string) {
    const cognitoSessions = this.decrypt();

    this._setPassword(password);
    this.updateState({
      cognitoSessions: this.encrypt(cognitoSessions),
    });
  }

  private _updateMemo() {
    this._setSession({ memo: this.memo });
  }

  private _setPassword(password?: string | null) {
    this.password = password;
    this._setSession({ password });
  }

  private encrypt(object: unknown): string {
    const jsonObj = JSON.stringify(object);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return seedUtils.encryptSeed(jsonObj, this.password!);
  }

  private decrypt(): Record<string, unknown> {
    const encryptedText = this.getState().cognitoSessions;

    try {
      if (!encryptedText) {
        return {};
      }
      const decryptedJson = seedUtils.decryptSeed(
        encryptedText,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.password!
      );
      return JSON.parse(decryptedJson);
    } catch (e) {
      throw new Error('Invalid password');
    }
  }
}

export interface IdentityApi {
  signBytes: (bytes: number[] | Uint8Array) => Promise<string>;
}

export class IdentityController implements IdentityApi {
  protected getNetwork;
  protected getSelectedAccount;
  protected getIdentityConfig;
  private network: NetworkName | undefined;
  // identity properties
  private readonly seed = seedUtils.Seed.create();
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

  updateVault(oldPassword: string, newPassword: string) {
    this.unlock(oldPassword);
    this.store.update(newPassword);
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

  async signIn(
    username: string,
    password: string
  ): Promise<
    CognitoUser &
      Partial<{ challengeName: AuthChallenge; challengeParam: unknown }>
  > {
    this.clearSession();

    return new Promise<
      CognitoUser &
        Partial<{ challengeName: AuthChallenge; challengeParam: unknown }>
    >((resolve, reject) => {
      if (!this.userPool) {
        return reject(new Error('No UserPool'));
      }

      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool,
        Storage: this.store,
      });

      this.user = user;
      this.userData = { username, password };

      this.user.authenticateUser(
        new AuthenticationDetails({
          Username: username,
          Password: password,
          ClientMetadata: {
            'custom:encryptionKey': this.seed.keyPair.publicKey,
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (user as any).challengeName;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (user as any).challengeParam;
            resolve(user);
          },

          onFailure: err => {
            reject(err);
          },
          customChallenge(challengeParam) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeName = 'CUSTOM_CHALLENGE';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeParam = challengeParam;
            resolve(user);
          },
          mfaRequired(challengeName, challengeParam) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeName = challengeName;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeParam = challengeParam;
            resolve(user);
          },
          mfaSetup(challengeName, challengeParam) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeName = challengeName;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeParam = challengeParam;
            resolve(user);
          },
          newPasswordRequired(userAttributes, requiredAttributes) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeName = 'NEW_PASSWORD_REQUIRED';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeParam = {
              userAttributes,
              requiredAttributes,
            };
            resolve(user);
          },
          totpRequired(challengeName, challengeParam) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeName = challengeName;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeParam = challengeParam;
            resolve(user);
          },
          selectMFAType(challengeName, challengeParam) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeName = challengeName;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (user as any).challengeParam = challengeParam;
            resolve(user);
          },
        }
      );
    });
  }

  async confirmSignIn(
    code: string,
    mfaType: MFAType = 'SOFTWARE_TOKEN_MFA'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.user) {
        return reject(new Error('Not authenticated'));
      }

      this.user.sendMFACode(
        code,
        {
          onSuccess: async session => {
            if (this.user) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              delete (this.user as any).challengeName;
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
          'custom:encryptionKey': this.seed.keyPair.publicKey,
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

  persistSession(uuid: string) {
    this.store.persist(this.getUserId(uuid));
  }

  updateSession() {
    const selectedAccount = this.getSelectedAccount();

    if (selectedAccount?.type !== 'wx') {
      throw new Error('selectedAccount is not a wx account');
    }

    this.persistSession(selectedAccount.uuid);
    this.clearSession();
  }

  async restoreSession(uuid: string) {
    this.clearSession();
    // set current user session
    this.store.restore(this.getUserId(uuid));
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
          .then(data => {
            this.persistSession(uuid);
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
    const currentPublicKey = this.seed.keyPair.publicKey;
    const isValidTime = payload.exp - currentTime > 10;
    const isValidPublicKey =
      payload['custom:encryptionKey'] === currentPublicKey;

    if (isValidPublicKey && isValidTime) {
      return Promise.resolve();
    }

    return this.refreshSession();
  }

  private async refreshSession() {
    const meta = { 'custom:encryptionKey': this.seed.keyPair.publicKey };

    return new Promise<unknown>((resolve, reject) => {
      if (!this.user) {
        return reject(new Error('Not authenticated'));
      }

      this.user.updateAttributes(
        [
          new CognitoUserAttribute({
            Name: 'custom:encryptionKey',
            Value: this.seed.keyPair.publicKey,
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

  removeSession(uuid: string) {
    this.clearSession();
    this.persistSession(uuid);
  }

  async signBytes(bytes: number[] | Uint8Array): Promise<string> {
    const selectedAccount = this.getSelectedAccount();

    if (selectedAccount?.type !== 'wx') {
      throw new Error('selectedAccount is not a wx account');
    }

    const userId = selectedAccount.uuid;
    await this.restoreSession(userId);

    const signature = libs.crypto.base58Decode(
      libs.crypto.signBytes(this.seed.keyPair, bytes)
    );
    const response = await this.signByIdentity({
      payload: libs.crypto.base64Encode(bytes),
      signature: libs.crypto.base64Encode(signature),
    });

    this.clearSession();

    return libs.crypto.base58Encode(
      libs.crypto.base64Decode(response.signature)
    );
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
    }).then(response => response.json());
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
