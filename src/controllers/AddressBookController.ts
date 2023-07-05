import ObservableStore from 'obs-store';
import {
  fromEthereumToWavesAddress,
  isEthereumAddress,
} from 'ui/utils/ethereum';

import { type ExtensionStorage } from '../storage/storage';

export class AddressBookController {
  private store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ addresses: {} }),
    );
    extensionStorage.subscribe(this.store);
  }

  setAddress(address: string, name: string) {
    const { addresses } = this.store.getState();
    this.store.updateState({ addresses: { ...addresses, [address]: name } });
  }

  setAddresses(newAddresses: Record<string, string>) {
    const { addresses } = this.store.getState();
    this.store.updateState({ addresses: { ...newAddresses, ...addresses } });
  }

  removeAddress(address: string) {
    const { addresses } = this.store.getState();
    delete addresses[address];
    this.store.updateState({ addresses });
  }

  migrate() {
    const { addresses } = this.store.getState();
    this.store.updateState({
      addresses: Object.entries(addresses).reduce(
        (acc, [address, name]) => ({
          ...acc,
          [isEthereumAddress(address)
            ? fromEthereumToWavesAddress(address)
            : address]: name,
        }),
        {},
      ),
    });
  }
}
