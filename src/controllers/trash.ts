import ObservableStore from 'obs-store';

import { type ExtensionStorage } from '../storage/storage';

const MAX_ITEMS = 200;

export interface TrashItem {
  address: string;
  walletsData: string;
}

export class TrashController {
  #store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.#store = new ObservableStore(
      extensionStorage.getInitState({ data: [] }),
    );

    extensionStorage.subscribe(this.#store);
  }

  addItem(newItem: TrashItem) {
    const { data } = this.#store.getState();
    const newData = [...data, newItem];

    if (newData.length > MAX_ITEMS) {
      newData.splice(0, newData.length - MAX_ITEMS);
    }

    this.#store.updateState({ data: newData });
  }
}
