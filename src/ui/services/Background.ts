import type { __BackgroundUiApiDirect } from 'background';
import type { IdentityUser } from 'controllers/IdentityController';
import type { AnalyticsEvent } from 'controllers/statistics';
import type { MessageInputOfType, MessageTx } from 'messages/types';
import type { MoneyLike } from 'messages/types';
import type { NetworkName } from 'networks/types';
import type { PreferencesAccount } from 'preferences/types';
import type { UiState } from 'store/reducers/updateState';
import type { CreateWalletInput } from 'wallets/types';

import type { IgnoreErrorsContext } from '../../constants';
import type { StorageLocalState } from '../../storage/storage';

export type BackgroundUiApi = __BackgroundUiApiDirect;

class Background {
  static instance: Background;
  background: BackgroundUiApi | undefined;
  initPromise: Promise<void>;
  updatedByUser = false;
  _connect: () => void;
  _defer: {
    resolve?: () => void;
    reject?: () => void;
    promise?: Promise<unknown>;
  };
  _lastUpdateIdle = 0;
  _tmr: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this._connect = () => undefined;
    this._defer = {};
    this.initPromise = new Promise((res, rej) => {
      this._defer.resolve = res;
      this._defer.reject = rej;
    });
    this._defer.promise = this.initPromise;
  }

  init(background: BackgroundUiApi) {
    this.background = background;
    this._connect = () => undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._defer.resolve!();
  }

  setConnect(connect: () => void) {
    this._connect = connect;
  }

  async getState<K extends keyof StorageLocalState>(params?: K[]) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.getState(params);
  }

  async updateIdle() {
    this.updatedByUser = true;
    this._updateIdle();
  }

  async setIdleOptions(options: { type: string }) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setIdleOptions(options);
  }

  async allowOrigin(origin: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.allowOrigin(origin);
  }

  async disableOrigin(origin: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.disableOrigin(origin);
  }

  async deleteOrigin(origin: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.deleteOrigin(origin);
  }

  async setAutoSign(
    origin: string,
    options: { interval: number; totalAmount: number }
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
    return (this.background!.setAutoSign as any)(origin, options);
  }

  async setNotificationPermissions(options: {
    origin: string;
    canUse: boolean | null;
  }) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setNotificationPermissions(options);
  }

  async setCurrentLocale(lng: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setCurrentLocale(lng);
  }

  async setUiState(newUiState: UiState) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setUiState(newUiState);
  }

  async selectAccount(address: string, network: NetworkName): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.selectAccount(address, network);
  }

  async addWallet(
    input: CreateWalletInput,
    network: NetworkName,
    networkCode: string
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.addWallet(input, network, networkCode);
  }

  async batchAddWallets(
    inputs: Array<
      CreateWalletInput & { network: NetworkName; networkCode: string }
    >
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.batchAddWallets(inputs);
  }

  async removeWallet(address: string, network: NetworkName): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.removeWallet(address, network);
  }

  async deleteVault() {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.deleteVault();
  }

  async closeNotificationWindow(): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.closeNotificationWindow();
  }

  async showTab(url: string, name: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.showTab(url, name);
  }

  async closeCurrentTab(): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.closeCurrentTab();
  }

  async lock(): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.lock();
  }

  async unlock(password: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.unlock(password);
  }

  async initVault(password: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.initVault(password);
  }

  async assertPasswordIsValid(password: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this.background!.assertPasswordIsValid(password);
  }

  async getAccountSeed(
    address: string,
    network: NetworkName,
    password: string
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.getAccountSeed(address, network, password);
  }

  async getAccountEncodedSeed(
    address: string,
    network: NetworkName,
    password: string
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.getAccountEncodedSeed(address, network, password);
  }

  async getAccountPrivateKey(
    address: string,
    network: NetworkName,
    password: string
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.getAccountPrivateKey(address, network, password);
  }

  async editWalletName(address: string, name: string, network: NetworkName) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.editWalletName(address, name, network);
  }

  async newPassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.newPassword(oldPassword, newPassword);
  }

  async clearMessages(): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.clearMessages();
  }

  async approve(messageId: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.approve(messageId);
  }

  async reject(messageId: string, forever = false): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.reject(messageId, forever);
  }

  async updateTransactionFee(messageId: string, fee: MoneyLike) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.updateTransactionFee(messageId, fee);
  }

  async setNetwork(network: NetworkName): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setNetwork(network);
  }

  async setCustomNode(url: string | null, network: NetworkName) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setCustomNode(url, network);
  }

  async setCustomCode(code: string | null, network: NetworkName) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setCustomCode(code, network);
  }

  async setCustomMatcher(url: string | null, network: NetworkName) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setCustomMatcher(url, network);
  }

  async assetInfo(assetId: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.assetInfo(assetId || 'WAVES');
  }

  async updateAssets(
    assetIds: string[],
    options: { ignoreCache?: boolean } = {}
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this.background!.updateAssets(assetIds, options);
  }

  async updateUsdPricesByAssetIds(assetIds: string[]) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this.background!.updateUsdPricesByAssetIds(assetIds);
  }

  async setAddress(address: string, name: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setAddress(address, name);
  }

  async setAddresses(addresses: Record<string, string>): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.setAddresses(addresses);
  }

  async removeAddress(address: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.removeAddress(address);
  }

  async toggleAssetFavorite(assetId: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.toggleAssetFavorite(assetId);
  }

  async deleteNotifications(ids: string[]) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.deleteNotifications(ids);
  }

  async track(event: AnalyticsEvent) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.track(event);
  }

  async updateCurrentAccountBalance() {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this.background!.updateCurrentAccountBalance();
  }

  async updateOtherAccountsBalances() {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return await this.background!.updateOtherAccountsBalances();
  }

  async signTransaction(account: PreferencesAccount, tx: MessageTx) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.signTransaction(account, tx);
  }

  async broadcastTransaction(tx: MessageTx) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.broadcastTransaction(tx);
  }

  async signAndPublishTransaction(
    data: MessageInputOfType<'transaction'>['data']
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.signAndPublishTransaction(data);
  }

  async getExtraFee(address: string, network: NetworkName) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.getExtraFee(address, network);
  }

  async getMessageById(messageId: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.getMessageById(messageId);
  }

  async shouldIgnoreError(context: IgnoreErrorsContext, message: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.shouldIgnoreError(context, message);
  }

  async identityRestore(userId: string): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
    return (await this.background!.identityRestore(userId)) as any;
  }

  async identityUpdate(): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.identityUpdate();
  }

  async identityClear(): Promise<void> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.identityClear();
  }

  async identitySignIn(username: string, password: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.identitySignIn(username, password);
  }

  async identityConfirmSignIn(code: string) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.identityConfirmSignIn(code);
  }

  async identityUser(): Promise<IdentityUser> {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
    return (await this.background!.identityUser()) as any;
  }

  async ledgerSignResponse(requestId: string, error: unknown): Promise<void>;
  async ledgerSignResponse(
    requestId: string,
    error: null,
    signature: string
  ): Promise<void>;
  async ledgerSignResponse(
    requestId: string,
    error: unknown,
    signature?: string
  ) {
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.ledgerSignResponse(
      requestId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error && (error as any).message ? (error as any).message : null,
      signature
    );
  }

  async _updateIdle() {
    const now = Date.now();

    if (this._tmr != null) {
      clearTimeout(this._tmr);
    }

    this._tmr = setTimeout(() => this._updateIdle(), 4000);

    if (!this.updatedByUser || now - this._lastUpdateIdle < 4000) {
      return null;
    }

    this.updatedByUser = false;
    this._lastUpdateIdle = now;
    await this.initPromise;
    this._connect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.background!.updateIdle();
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
  Debug = 'debug',
}
