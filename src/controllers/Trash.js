import ObservableStore from 'obs-store';

const MAX_ITEMS = 200;

export class TrashController {
  constructor(options = {}) {
    const defaults = {
      data: [],
    };
    const initState = Object.assign({}, defaults, options.initState);
    this.store = new ObservableStore(initState);
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
