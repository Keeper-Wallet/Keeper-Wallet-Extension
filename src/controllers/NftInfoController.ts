import { NetworkName } from 'networks/types';
import { NftAssetDetail } from 'nfts/types';
import { fetchAllNfts } from 'nfts/utils';
import ObservableStore from 'obs-store';

import { ExtensionStorage } from '../storage/storage';
import { NetworkController } from './network';

export class NftInfoController {
  private store;
  private getNetwork;
  private getNode;

  constructor({
    extensionStorage,
    getNetwork,
    getNode,
  }: {
    extensionStorage: ExtensionStorage;
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
  }) {
    const initState = extensionStorage.getInitState({ nfts: {} });
    this.store = new ObservableStore(initState);
    extensionStorage.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.getNode = getNode;
  }

  getNfts() {
    return this.store.getState().nfts;
  }

  async updateNfts(nfts: NftAssetDetail[]) {
    if (this.getNetwork() !== NetworkName.Mainnet) {
      return;
    }

    const storeNfts = this.getNfts();
    const nftsToFetch = nfts.filter(nft => !storeNfts[nft.assetId]);

    if (nftsToFetch.length === 0) {
      return;
    }

    const nftInfos = await fetchAllNfts(this.getNode(), nftsToFetch);

    nftInfos.forEach(info => {
      storeNfts[info.id] = info;
    });

    this.store.updateState({ nfts: storeNfts });
  }
}
