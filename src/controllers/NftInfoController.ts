import * as ObservableStore from 'obs-store';
import { NetworkName } from 'accounts/types';
import { AssetDetail } from 'ui/services/Background';
import { fetchAllNfts } from 'nfts/utils';
import { DuckInfo } from 'nfts/ducks/utils';
import { SignArtInfo } from 'nfts/signArt/utils';

export type NftDetails = AssetDetail & { assetId: string };

export class NftInfoController {
  store: ObservableStore<{
    nfts: Record<string, DuckInfo | SignArtInfo>;
  }>;
  protected getNetwork: () => NetworkName;

  constructor(
    options: { initState?: unknown; getNetwork?: () => NetworkName } = {}
  ) {
    this.store = new ObservableStore(
      Object.assign(
        {},
        {
          nfts: {},
        },
        options.initState
      )
    );
    this.getNetwork = options.getNetwork;
  }

  getNfts() {
    return this.store.getState().nfts;
  }

  async updateNfts(nfts: Array<NftDetails>) {
    if (nfts.length === 0) {
      return;
    }

    if (this.getNetwork() !== 'mainnet') {
      return;
    }

    const storeNfts = this.getNfts();
    const fetchNfts = nfts.filter(nft => !storeNfts[nft.assetId]);
    const infoNfts = await fetchAllNfts(fetchNfts);

    infoNfts.forEach(info => (storeNfts[info.id] = info));

    this.store.updateState({ nfts: storeNfts });
  }
}
