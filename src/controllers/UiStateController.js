import ObservableStore from 'obs-store';

export class UiStateController {
  constructor({ localStore }) {
    const defaults = {
      uiState: {},
    };
    this.store = new ObservableStore(localStore.getInitState(defaults));
    localStore.subscribe(this.store);
  }

  getUiState() {
    return this.store.getState().uiState;
  }

  setUiState(uiState) {
    this.store.updateState({ uiState });
    return this.getUiState();
  }
}
