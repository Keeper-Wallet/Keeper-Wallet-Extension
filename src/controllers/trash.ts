import ExtensionStore from 'lib/localStore';
import ObservableStore from 'obs-store';
import { PreferencesAccount } from 'preferences/types';

const MAX_ITEMS = 200;

export interface TrashItem {
  walletsData: string | PreferencesAccount;
  address: string;
}

export class TrashController {
  private store;

  constructor({ localStore }: { localStore: ExtensionStore }) {
    this.store = new ObservableStore(localStore.getInitState({ data: [] }));
    localStore.subscribe(this.store);
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
