import * as ObservableStore from 'obs-store';
import LocalStore from '../lib/localStore';
import {
  fromEthereumToWavesAddress,
  isEthereumAddress,
} from 'ui/utils/ethereum';

type AddressBookState = { addresses: Record<string, string> };

type Options = {
  localStore: LocalStore;
};

export class AddressBookController {
  store: ObservableStore<AddressBookState>;

  constructor({ localStore }: Options) {
    this.store = new ObservableStore(
      localStore.getInitState({ addresses: {} })
    );
    localStore.subscribe(this.store);
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
        {}
      ),
    });
  }
}
