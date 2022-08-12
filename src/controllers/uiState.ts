import { ExtensionStorage } from '../storage/storage';
import ObservableStore from 'obs-store';
import { UiState } from 'ui/reducers/updateState';

export class UiStateController {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        uiState: {},
      })
    );
    extensionStorage.subscribe(this.store);
  }

  getUiState() {
    return this.store.getState().uiState;
  }

  setUiState(uiState: UiState) {
    this.store.updateState({ uiState });
    return this.getUiState();
  }
}
