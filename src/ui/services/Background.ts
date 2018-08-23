import { store, IState } from '../store';
import { i18n } from '../i18n';

class Background {

    static instance: Background;
    static background: any;

    async updateState(): Promise<void> {
        const state = await Background.background.getState();
        this._onUpdate(state);
    }

    init(background) {
        if (Background.background) {
            return;
        }

        background.on('update', this._onUpdate.bind(this));
        Background.background = background;
    }

    setCurrentLocale(lng): Promise<void> {
        return Background.background.setCurrentLocale(lng);
    }

    async selectAccount(address): Promise<void> {
        return Background.background.selectAccount(address);
    }

    async addWallet(data): Promise<void> {
        return Background.background.addWallet(data);
    }

    async removeWallet(address): Promise<void> {
        return Background.background.removeWallet(address);
    }

    async lock(): Promise<void> {
        return Background.background.lock();
    }

    async unlock(password): Promise<void> {
        return Background.background.unlock(password);
    }

    async initVault(): Promise<void> {
        return Background.background.initVault();
    }

    async exportAccount(): Promise<void> {
        return Background.background.exportAccount();
    }

    async clearMessages(): Promise<void> {
        return Background.background.clearMessages();
    }

    async sign(): Promise<void> {
        return Background.background.sign();
    }

    async reject(): Promise<void> {
        return Background.background.reject();
    }

    async setNetwork(network): Promise<void> {
        return Background.background.setNetwork(network);
    }


    _onUpdate(state: IState) {
        i18n.changeLanguage(state.currentLocale);
        console.log('store', state);
        store.dispatch({state, type: 'updateState'});
    }
}

export default new Background();

