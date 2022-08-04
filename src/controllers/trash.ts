import ExtensionStore from 'lib/localStore';
import ObservableStore from 'obs-store';

const MAX_ITEMS = 200;

export class TrashController {
  store: ObservableStore;

  constructor({ localStore }: { localStore: ExtensionStore }) {
    const defaults = { data: [] };
    this.store = new ObservableStore(localStore.getInitState(defaults));
    localStore.subscribe(this.store);
  }

  getData() {
    return this.store.getState().data;
  }

  addData(saveData) {
    const { data } = this.store.getState();
    const dataToSave = [...data, saveData];
    if (dataToSave.length > MAX_ITEMS) {
      dataToSave.splice(0, dataToSave.length - MAX_ITEMS);
    }
    this._saveData(dataToSave);
  }

  _saveData(data) {
    this.store.updateState({ data });
  }
}
