import ExtensionStore from 'lib/localStore';
import ObservableStore from 'obs-store';
import { UiState } from 'ui/reducers/updateState';

export class UiStateController {
  private store;

  constructor({ localStore }: { localStore: ExtensionStore }) {
    this.store = new ObservableStore(
      localStore.getInitState({
        uiState: {},
      })
    );
    localStore.subscribe(this.store);
  }

  getUiState() {
    return this.store.getState().uiState;
  }

  setUiState(uiState: UiState) {
    this.store.updateState({ uiState });
    return this.getUiState();
  }
}
