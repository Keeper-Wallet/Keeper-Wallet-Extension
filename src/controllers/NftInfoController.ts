import { NetworkName } from 'networks/types';
import { fetchNftInfo } from 'nfts/nfts';
import { type NftAssetDetail } from 'nfts/types';
import ObservableStore from 'obs-store';

import { type ExtensionStorage } from '../storage/storage';
import { type NetworkController } from './network';

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

  async updateNfts(nftsAssetDetails: NftAssetDetail[]) {
    if (this.getNetwork() !== NetworkName.Mainnet) {
      return;
    }

    const { nfts } = this.store.getState();
    const nftsToFetch = nftsAssetDetails.filter(nft => !nfts[nft.assetId]);
    const nftInfos = await fetchNftInfo(this.getNode(), nftsToFetch);

    nftInfos.forEach(info => {
      nfts[info.id] = info;
    });

    this.store.updateState({ nfts });
  }
}
