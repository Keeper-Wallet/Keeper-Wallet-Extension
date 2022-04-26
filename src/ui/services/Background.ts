import { IAssetInfo } from '@waves/data-entities/dist/entities/Asset';
import { ExchangePool } from 'ui/components/pages/swap/channelClient';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AuthChallenge, IdentityUser } from 'controllers/IdentityController';
import { Account } from 'accounts/types';

function prepareErrorMessage(err: any) {
  return err && err.message ? err.message : String(err);
}

class Background {
  static instance: Background;
  background: any;
  initPromise: Promise<void>;
  updatedByUser = false;
  _connect;
  _defer;
  _lastUpdateIdle = 0;
  _tmr;

  constructor() {
    this._defer = {};
    this.initPromise = new Promise((res, rej) => {
      this._defer.resolve = res;
      this._defer.reject = rej;
    });
    this._defer.promise = this.initPromise;
  }

  init(background) {
    this.background = background;
    this._connect = () => {};
    this._defer.resolve();
  }

  setConnect(connect) {
    this._connect = connect;
  }

  async getState() {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getState();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async updateIdle() {
    this.updatedByUser = true;
    this._updateIdle();
  }

  async setIdleOptions(options: { type: string }) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setIdleOptions(options);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async allowOrigin(origin: string) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.allowOrigin(origin);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async disableOrigin(origin: string) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.disableOrigin(origin);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async deleteOrigin(origin: string) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.deleteOrigin(origin);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setAutoSign(
    origin: string,
    options: { interval: number; totalAmount: number }
  ) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setAutoSign(origin, options);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setNotificationPermissions(options: {
    origin: string;
    canUse: boolean;
  }) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setNotificationPermissions(options);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setCurrentLocale(lng): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setCurrentLocale(lng);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setUiState(newUiState) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setUiState(newUiState);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async selectAccount(address, network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.selectAccount(address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async addWallet(data): Promise<Account> {
    await this.initPromise;
    await this._connect();
    return await this.background.addWallet(data);
  }

  async removeWallet(address, network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      if (address) {
        return await this.background.removeWallet(address, network);
      }

      return await this.deleteVault();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async deleteVault() {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.deleteVault();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async closeNotificationWindow(): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.closeNotificationWindow();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async showTab(url: string, name: string): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.showTab(url, name);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async lock(): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.lock();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async unlock(password): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.unlock(password);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async initVault(password?): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.initVault(password);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getAccountSeed(
    address: string,
    network: string,
    password: string
  ): Promise<string> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getAccountSeed(address, network, password);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getAccountEncodedSeed(
    address: string,
    network: string,
    password: string
  ): Promise<string> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getAccountEncodedSeed(
        address,
        network,
        password
      );
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getAccountPrivateKey(
    address: string,
    network: string,
    password: string
  ): Promise<string> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getAccountPrivateKey(
        address,
        network,
        password
      );
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async exportSeed(address, network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.encryptedSeed(address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async editWalletName(address, name, network) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.editWalletName(address, name, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async newPassword(oldPassword, newPassword): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.newPassword(oldPassword, newPassword);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async clearMessages(): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.clearMessages();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async deleteMessage(id): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.deleteMessage(id);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async approve(messageId, address, network): Promise<any> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.approve(messageId, address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async reject(messageId, forever = false): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.reject(messageId, forever);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async updateTransactionFee(messageId, fee): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.updateTransactionFee(messageId, fee);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getGroupNotificationsByAccount(selectedAccount): Promise<unknown[]> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getGroupNotificationsByAccount(
        selectedAccount
      );
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setNetwork(network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setNetwork(network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setCustomNode(url, network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setCustomNode(url, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setCustomCode(code, network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setCustomCode(code, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async setCustomMatcher(url, network): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.setCustomMatcher(url, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async assetInfo(assetId: string): Promise<AssetDetail> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.assetInfo(assetId || 'WAVES');
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async updateAssets(assetIds: string[]): Promise<AssetDetail> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.updateAssets(assetIds);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async toggleAssetFavorite(assetId: string): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.toggleAssetFavorite(assetId);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async deleteNotifications(ids) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.deleteNotifications(ids);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async sendEvent(event: 'addWallet', properties: { type: string });
  async sendEvent(event: 'click', properties: { id: string });
  async sendEvent(event: string, properties: any = {}) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.sendEvent(event, properties);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async updateBalances() {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.updateBalances();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async swapAssets(params: {
    feeCoins: string;
    feeAssetId: string;
    fromAssetId: string;
    fromCoins: string;
    minReceivedCoins: string;
    route: ExchangePool[];
    slippageTolerance: number;
  }): Promise<{ transactionId: string }> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.swapAssets(params);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async signAndPublishTransaction(data: WavesKeeper.TSignTransactionData) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.signAndPublishTransaction(data);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getMinimumFee(txType: number): Promise<number> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getMinimumFee(txType);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getExtraFee(address: string, network: string): Promise<number> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getExtraFee(address, network);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async getMessageById(messageId: string) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.getMessageById(messageId);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async shouldIgnoreError(context: string, message: string): Promise<number> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.shouldIgnoreError(context, message);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async identityRestore(userId: string): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.identityRestore(userId);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async identityUpdate(): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.identityUpdate();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async identityClear(): Promise<void> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.identityClear();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async identitySignIn(
    username: string,
    password: string
  ): Promise<
    CognitoUser & Partial<{ challengeName: AuthChallenge; challengeParam: any }>
  > {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.identitySignIn(username, password);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async identityConfirmSignIn(code: string) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.identityConfirmSignIn(code);
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async identityUser(): Promise<IdentityUser> {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.identityUser();
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async ledgerSignResponse(requestId: string, err: Error): Promise<void>;
  async ledgerSignResponse(
    requestId: string,
    err: null,
    signature: string
  ): Promise<void>;
  async ledgerSignResponse(
    requestId: string,
    err: Error | null,
    signature?: string
  ) {
    try {
      await this.initPromise;
      await this._connect();
      return await this.background.ledgerSignResponse(
        requestId,
        err && err.message ? err.message : null,
        signature
      );
    } catch (err) {
      throw new Error(prepareErrorMessage(err));
    }
  }

  async _updateIdle() {
    const now = Date.now();
    clearTimeout(this._tmr);
    this._tmr = setTimeout(() => this._updateIdle(), 4000);

    if (!this.updatedByUser || now - this._lastUpdateIdle < 4000) {
      return null;
    }

    this.updatedByUser = false;
    this._lastUpdateIdle = now;
    await this.initPromise;
    await this._connect();
    return this.background.updateIdle();
  }
}

export default new Background();

export enum WalletTypes {
  New = 'new',
  Seed = 'seed',
  EncodedSeed = 'encoded_seed',
  PrivateKey = 'private_key',
  Wx = 'wx',
  Ledger = 'ledger',
  Keystore = 'keystore',
  KeystoreWx = 'keystore_wx',
}

export interface AssetDetail extends IAssetInfo {
  displayName: string;
  originTransactionId: string;
  issuer?: string;
  isFavorite?: boolean;
  isSuspicious?: boolean;
}
