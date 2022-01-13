import { IAssetInfo } from '@waves/data-entities/dist/entities/Asset';

class Background {
  static instance: Background;
  background: any;
  initPromise: Promise<void>;
  updatedByUser = false;
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
    this._defer.resolve();
  }

  async updateIdle() {
    this.updatedByUser = true;
    this._updateIdle();
  }

  async setIdleOptions(options: { type: string }) {
    try {
      await this.initPromise;
      return await this.background.setIdleOptions(options);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async allowOrigin(origin: string) {
    try {
      await this.initPromise;
      return await this.background.allowOrigin(origin);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async disableOrigin(origin: string) {
    try {
      await this.initPromise;
      return await this.background.disableOrigin(origin);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deleteOrigin(origin: string) {
    try {
      await this.initPromise;
      return await this.background.deleteOrigin(origin);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setAutoSign(
    origin: string,
    options: { interval: number; totalAmount: number }
  ) {
    try {
      await this.initPromise;
      return await this.background.setAutoSign(origin, options);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setNotificationPermissions(options: {
    origin: string;
    canUse: boolean;
  }) {
    try {
      await this.initPromise;
      return await this.background.setNotificationPermissions(options);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setCurrentLocale(lng): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCurrentLocale(lng);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setUiState(newUiState) {
    try {
      await this.initPromise;
      return await this.background.setUiState(newUiState);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async selectAccount(address, network): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.selectAccount(address, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async addWallet(data): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.addWallet(data);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async removeWallet(address, network): Promise<void> {
    try {
      await this.initPromise;
      if (address) {
        return await this.background.removeWallet(address, network);
      }

      return await this.deleteVault();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deleteVault() {
    try {
      await this.initPromise;
      return await this.background.deleteVault();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async closeNotificationWindow(): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.closeNotificationWindow();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async lock(): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.lock();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async unlock(password): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.unlock(password);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async initVault(password?): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.initVault(password);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async exportAccount(address, password, network): Promise<string> {
    try {
      await this.initPromise;
      return await this.background.exportAccount(address, password, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async exportSeed(address, network): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.encryptedSeed(address, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async editWalletName(address, name, network) {
    try {
      await this.initPromise;
      return await this.background.editWalletName(address, name, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async newPassword(oldPassword, newPassword): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.newPassword(oldPassword, newPassword);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async clearMessages(): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.clearMessages();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deleteMessage(id): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.deleteMessage(id);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async approve(messageId, address, network): Promise<any> {
    try {
      await this.initPromise;
      return await this.background.approve(messageId, address, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async reject(messageId, forever = false): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.reject(messageId, forever);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateTransactionFee(messageId, fee): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.updateTransactionFee(messageId, fee);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setNetwork(network): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setNetwork(network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setCustomNode(url, network): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCustomNode(url, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setCustomCode(code, network): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCustomCode(code, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async setCustomMatcher(url, network): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.setCustomMatcher(url, network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async assetInfo(assetId: string): Promise<AssetDetail> {
    try {
      await this.initPromise;
      return await this.background.assetInfo(assetId || 'WAVES');
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async toggleAssetFavorite(assetId: string): Promise<void> {
    try {
      await this.initPromise;
      return await this.background.toggleAssetFavorite(assetId);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async deleteNotifications(ids) {
    try {
      await this.initPromise;
      return await this.background.deleteNotifications(ids);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getUserList(type: string, from: number, to: number): Promise<any> {
    try {
      await this.initPromise;
      return await this.background.getUserList(type, from, to);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async sendEvent(event: 'addWallet', properties: { type: string });
  async sendEvent(event: 'click', properties: { id: string });
  async sendEvent(event: string, properties: any = {}) {
    try {
      await this.initPromise;
      return await this.background.sendEvent(event, properties);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateBalances() {
    try {
      await this.initPromise;
      return await this.background.updateBalances();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async signAndPublishTransaction(data: WavesKeeper.TSignTransactionData) {
    try {
      await this.initPromise;
      return await this.background.signAndPublishTransaction(data);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateExchangers(network: string) {
    try {
      await this.initPromise;
      return await this.background.updateExchangers(network);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async performSwap({
    exchangerId,
    fee,
    feeAssetId,
    fromAssetId,
    fromCoins,
    minReceivedCoins,
    toAssetId,
    toCoins,
  }: {
    exchangerId: string;
    fee: string;
    feeAssetId: string;
    fromAssetId: string;
    fromCoins: string;
    minReceivedCoins: string;
    toAssetId: string;
    toCoins: string;
  }): Promise<{ transactionId: string }> {
    try {
      await this.initPromise;

      return await this.background.performSwap({
        exchangerId,
        fee,
        feeAssetId,
        fromAssetId,
        fromCoins,
        minReceivedCoins,
        toAssetId,
        toCoins,
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getMinimumFee(txType: number) {
    try {
      await this.initPromise;
      return await this.background.getMinimumFee(txType);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getExtraFee(address: string, network: string): Promise<number> {
    try {
      await this.initPromise;
      return await this.background.getExtraFee(address, network);
    } catch (err) {
      throw new Error(err.message);
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
    return this.background.updateIdle();
  }
}

export default new Background();

export enum WalletTypes {
  New = 'new',
  Seed = 'seed',
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
