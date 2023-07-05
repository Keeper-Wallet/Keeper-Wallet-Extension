import ObservableStore from 'obs-store';
import { type UiState } from 'store/reducers/updateState';

import { type ExtensionStorage } from '../storage/storage';

export class UiStateController {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        uiState: {},
      }),
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
