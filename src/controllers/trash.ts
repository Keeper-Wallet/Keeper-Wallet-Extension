import ObservableStore from 'obs-store';
import { PreferencesAccount } from 'preferences/types';

import { ExtensionStorage } from '../storage/storage';

const MAX_ITEMS = 200;

export interface TrashItem {
  walletsData: string | PreferencesAccount;
  address: string;
}

export class TrashController {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ data: [] })
    );
    extensionStorage.subscribe(this.store);
  }

  getData() {
    return this.store.getState().data;
  }

  addData(saveData: TrashItem) {
    const { data } = this.store.getState();
    const dataToSave = [...data, saveData];
    if (dataToSave.length > MAX_ITEMS) {
      dataToSave.splice(0, dataToSave.length - MAX_ITEMS);
    }
    this._saveData(dataToSave);
  }

  _saveData(data: TrashItem[]) {
    this.store.updateState({ data });
  }
}
