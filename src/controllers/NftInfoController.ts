import ObservableStore from 'obs-store';
import { fetchAllNfts } from 'nfts/utils';
import ExtensionStore from 'lib/localStore';
import { NetworkController } from './network';
import { NetworkName } from 'networks/types';

export class NftInfoController {
  private store;
  private getNetwork;
  private getNode;

  constructor({
    localStore,
    getNetwork,
    getNode,
  }: {
    localStore: ExtensionStore;
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
  }) {
    const initState = localStore.getInitState({ nfts: {} });
    this.store = new ObservableStore(initState);
    localStore.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.getNode = getNode;
  }

  getNfts() {
    return this.store.getState().nfts;
  }

  async updateNfts(
    nfts: Array<{ assetId: string; issuer: string | undefined }>
  ) {
    if (nfts.length === 0) {
      return;
    }

    if (this.getNetwork() !== NetworkName.Mainnet) {
      return;
    }

    const storeNfts = this.getNfts();
    const fetchNfts = nfts.filter(nft => !storeNfts[nft.assetId]);
    const infoNfts = await fetchAllNfts(this.getNode(), fetchNfts);

    infoNfts.forEach(info => (storeNfts[info.id] = info));

    this.store.updateState({ nfts: storeNfts });
  }
}
