class Background {

    static instance: Background;
    background: any;
    initPromise: Promise<void>;
    onUpdateCb: Array<(state) => void> = [];
    _defer;

    constructor() {
        this._defer = {};
        this.initPromise = new Promise((res, rej) => {
            this._defer.resolve = res;
            this._defer.reject = rej;
        });
        this._defer.promise = this.initPromise;
    }

    on(cb: (state) => void) {
        if(this.onUpdateCb.indexOf(cb) > -1) {
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

    async selectAccount(address): Promise<void> {
        await this.initPromise;
        return this.background.selectAccount(address);
    }

    async addWallet(data): Promise<void> {
        await this.initPromise;
        return this.background.addWallet(data);
    }

    async removeWallet(address): Promise<void> {
        await this.initPromise;
        return this.background.removeWallet(address);
    }

    async lock(): Promise<void> {
        await this.initPromise;
        return this.background.lock();
    }

    async unlock(password): Promise<void> {
        await this.initPromise;
        return this.background.unlock(password);
    }

    async initVault(password): Promise<void> {
        await this.initPromise;
        return this.background.initVault(password);
    }

    async exportAccount(): Promise<void> {
        await this.initPromise;
        return this.background.exportAccount();
    }

    async clearMessages(): Promise<void> {
        await this.initPromise;
        return this.background.clearMessages();
    }

    async sign(): Promise<void> {
        await this.initPromise;
        return this.background.sign();
    }

    async reject(): Promise<void> {
        await this.initPromise;
        return this.background.reject();
    }

    async setNetwork(network): Promise<void> {
        await this.initPromise;
        return this.background.setNetwork(network);
    }

    _onUpdate(state: IState) {
        for (const cb of this.onUpdateCb) {
            cb(state);
        }
    }
}

export default new Background();

export interface IState {
    locked: boolean;
    hasAccount: boolean;
    currentLocale: string;
    accounts: Array<any>;
    currentNetwork: string;
    messages: Array<any>;
    balances: any;
    uiState: IUiState;
}

export interface IUiState {
    tab: string;
}
