import ObservableStore from 'obs-store';

export class UiStateController {
    constructor(options = {}) {
        const defaults = {
            uiState: {},
        };
        const initState = Object.assign({}, defaults, options.initState);
        this.store = new ObservableStore(initState);
    }

    getUiState() {
        return this.store.getState().uiState;
    }

    setUiState(uiState) {
        this.store.updateState({ uiState });
        return this.getUiState();
    }
}
