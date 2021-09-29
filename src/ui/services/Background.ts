class Background {
    static instance: Background;
    background: any;
    initPromise: Promise<void>;
    onUpdateCb: Array<(state) => void> = [];
    updatedByUser = false;
    _defer;
    _assetsStore;
    _lastUpdateIdle = 0;
    _tmr;

    constructor() {
        this._assetsStore = {};
        this._defer = {};
        this.initPromise = new Promise((res, rej) => {
            this._defer.resolve = res;
            this._defer.reject = rej;
        });
        this._defer.promise = this.initPromise;
    }

    on(cb: (state) => void) {
        if (this.onUpdateCb.indexOf(cb) > -1) {
            return null;
        }

        this.onUpdateCb.push(cb);
    }

    off(cb) {
        this.onUpdateCb = this.onUpdateCb.filter((cb2) => cb2 !== cb);
    }

    init(background) {
        background.on('update', this._onUpdate.bind(this));
        this.background = background;
        this._defer.resolve();
    }

    async updateIdle() {
        this.updatedByUser = true;
        this._updateIdle();
    }

    async setIdleOptions(options: { type: string }) {
        await this.initPromise;
        return this.background.setIdleOptions(options);
    }

    async allowOrigin(origin: string) {
        await this.initPromise;
        return this.background.allowOrigin(origin);
    }

    async disableOrigin(origin: string) {
        await this.initPromise;
        return this.background.disableOrigin(origin);
    }

    async deleteOrigin(origin: string) {
        await this.initPromise;
        return this.background.deleteOrigin(origin);
    }

    async setAutoSign(origin: string, options: { interval: number; totalAmount: number }) {
        await this.initPromise;
        return this.background.setAutoSign(origin, options);
    }

    async setNotificationPermissions(options: { origin: string; canUse: boolean }) {
        await this.initPromise;
        return this.background.setNotificationPermissions(options);
    }

    async getState() {
        await this.initPromise;
        const data = await this.background.getState();
        this._onUpdate(data);
        return data;
    }

    async setCurrentLocale(lng): Promise<void> {
        await this.initPromise;
        return this.background.setCurrentLocale(lng);
    }

    async setUiState(newUiState) {
        await this.initPromise;
        return this.background.setUiState(newUiState);
    }

    async selectAccount(address, network): Promise<void> {
        await this.initPromise;
        return this.background.selectAccount(address, network);
    }

    async addWallet(data): Promise<void> {
        await this.initPromise;
        return this.background.addWallet(data);
    }

    async removeWallet(address, network): Promise<void> {
        await this.initPromise;
        if (address) {
            return this.background.removeWallet(address, network);
        }

        return this.deleteVault();
    }

    async deleteVault() {
        await this.initPromise;
        return this.background.deleteVault();
    }

    async closeNotificationWindow(): Promise<void> {
        await this.initPromise;
        return this.background.closeNotificationWindow();
    }

    async lock(): Promise<void> {
        await this.initPromise;
        return this.background.lock();
    }

    async unlock(password): Promise<void> {
        await this.initPromise;
        return this.background.unlock(password);
    }

    async initVault(password?): Promise<void> {
        await this.initPromise;
        return this.background.initVault(password);
    }

    async exportAccount(address, password, network): Promise<void> {
        await this.initPromise;
        return this.background.exportAccount(address, password, network);
    }

    async exportSeed(address, network): Promise<void> {
        await this.initPromise;
        return this.background.encryptedSeed(address, network);
    }

    async editWalletName(address, name, network) {
        await this.initPromise;
        return this.background.editWalletName(address, name, network);
    }

    async newPassword(oldPassword, newPassword): Promise<void> {
        await this.initPromise;
        return this.background.newPassword(oldPassword, newPassword);
    }

    async clearMessages(): Promise<void> {
        await this.initPromise;
        return this.background.clearMessages();
    }

    async deleteMessage(id): Promise<void> {
        await this.initPromise;
        return this.background.deleteMessage(id);
    }

    async approve(messageId, address, network): Promise<any> {
        await this.initPromise;
        return this.background.approve(messageId, address, network);
    }

    async reject(messageId, forever = false): Promise<void> {
        await this.initPromise;
        return this.background.reject(messageId, forever);
    }

    async setNetwork(network): Promise<void> {
        await this.initPromise;
        return this.background.setNetwork(network);
    }

    async getNetworks(): Promise<void> {
        await this.initPromise;
        const networks = await this.background.getNetworks();
        this._onUpdate({ networks });
        return networks;
    }

    async setCustomNode(url, network): Promise<void> {
        await this.initPromise;
        return this.background.setCustomNode(url, network);
    }

    async setCustomCode(code, network): Promise<void> {
        await this.initPromise;
        return this.background.setCustomCode(code, network);
    }

    async setCustomMatcher(url, network): Promise<void> {
        await this.initPromise;
        return this.background.setCustomMatcher(url, network);
    }

    async assetInfo(assetId: string): Promise<any> {
        assetId = assetId || 'WAVES';

        if (this._assetsStore[assetId]) {
            return await this._assetsStore[assetId];
        }

        await this.initPromise;
        this._assetsStore[assetId] = this.background.assetInfo(assetId);

        try {
            return await this._assetsStore[assetId];
        } catch (e) {
            delete this._assetsStore[assetId];
            throw e;
        }
    }

    async deleteNotifications(ids) {
        await this.initPromise;
        return this.background.deleteNotifications(ids);
    }

    async getUserList(type: string, from: number, to: number): Promise<any> {
        await this.initPromise;
        return this.background.getUserList(type, from, to);
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

    _onUpdate(state: IState) {
        for (const cb of this.onUpdateCb) {
            cb(state);
        }
    }
}

export default new Background();

export interface IState {
    locked?: boolean;
    hasAccount?: boolean;
    currentLocale?: string;
    accounts?: Array<any>;
    currentNetwork?: string;
    messages?: Array<any>;
    balances?: any;
    uiState?: IUiState;
    networks?: Array<{ name; code }>;
}

export interface IUiState {
    tab: string;
}
