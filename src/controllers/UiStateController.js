import ObservableStore from 'obs-store';

export class UiStateController {
    constructor(options = {}) {
        const defaults = {
            uiState: {},
        };
        const initState = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(initState);
    }

    setUiState(uiState) {
        this.store.updateState({ uiState });
        return this.store.getState();
    }

    getUiState() {
        return this.store.getState().uiState;
    }
}
