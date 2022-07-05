import * as ObservableStore from 'obs-store';
import { NetworkName } from 'accounts/types';
import { fetchAllNfts } from 'nfts/utils';
import { NftDetails, NftInfo } from 'nfts';
import ExtensionStore from 'lib/localStore';

export class NftInfoController {
  store: ObservableStore<{
    nfts: Record<string, NftInfo>;
  }>;
  protected getNetwork: () => NetworkName;
  protected getNode: (network?: NetworkName) => string;

  constructor({
    localStore,
    getNetwork,
    getNode,
  }: {
    localStore?: ExtensionStore;
    getNetwork?: () => NetworkName;
    getNode?: (network?: NetworkName) => string;
  } = {}) {
    const defaults = { nfts: {} };
    const initState = localStore.getInitState(defaults);
    this.store = new ObservableStore(initState);
    localStore.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.getNode = getNode;
  }

  getNfts() {
    return this.store.getState().nfts;
  }

  async updateNfts(nfts: Array<NftDetails>) {
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
