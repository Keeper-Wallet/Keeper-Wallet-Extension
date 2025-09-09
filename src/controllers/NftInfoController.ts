import { NetworkName } from 'networks/types';
import { fetchNftInfo } from 'nfts/nfts';
import { type NftAssetDetail } from 'nfts/types';
import ObservableStore from 'obs-store';
import { BLOCKCHAIN_TYPES } from '../assets/constants';

import { type ExtensionStorage } from '../storage/storage';
import { type NetworkController } from './network';

export class NftInfoController {
  private store;
  private getNetwork;
  private getNode;
  private getCurrentBlockchainType;

  constructor({
    extensionStorage,
    getNetwork,
    getNode,
    getCurrentBlockchainType,
  }: {
    extensionStorage: ExtensionStorage;
    getNetwork: NetworkController['getNetwork'];
    getNode: NetworkController['getNode'];
    getCurrentBlockchainType?: () => string;
  }) {
    const initState = extensionStorage.getInitState({ nfts: {} });
    this.store = new ObservableStore(initState);
    extensionStorage.subscribe(this.store);

    this.getNetwork = getNetwork;
    this.getNode = getNode;
    this.getCurrentBlockchainType =
      getCurrentBlockchainType || (() => BLOCKCHAIN_TYPES.WAVES);
  }

  async updateNfts(nftsAssetDetails: NftAssetDetail[], forceUpdate: boolean) {
    if (forceUpdate) {
      const { nfts } = this.store.getState();
      nftsAssetDetails.forEach(asset => {
        nfts[`${asset.assetId}_${asset.tokenId}`] = asset;
      });

      this.store.updateState({
        nfts,
      });
      return;
    }
    const currentNetwork = this.getNetwork();
    const currentBlockchainType = this.getCurrentBlockchainType();

    // Support NFTs for both Waves mainnet and Unit0 networks
    const shouldFetchNfts =
      (currentBlockchainType === BLOCKCHAIN_TYPES.WAVES &&
        currentNetwork === NetworkName.Mainnet) ||
      currentBlockchainType === BLOCKCHAIN_TYPES.UNIT0;

    if (!shouldFetchNfts) {
      return;
    }

    const { nfts } = this.store.getState();
    const nftsToFetch = nftsAssetDetails.filter(nft => !nfts[nft.assetId]);

    if (nftsToFetch.length === 0) {
      return;
    }

    try {
      const nftInfos = await fetchNftInfo(this.getNode(), nftsToFetch);

      nftInfos.forEach(info => {
        nfts[info.id] = info;
      });

      this.store.updateState({ nfts });
    } catch (error) {
      console.warn('Failed to update NFT info:', error);
    }
  }
}
