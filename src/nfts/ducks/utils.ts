import { BaseInfo, NftVendor } from 'nfts/index';
import { NftAssetDetail } from 'nfts/types';

export interface DuckInfo extends BaseInfo {
  vendor: NftVendor.Ducks;
}

export function fetchAll(nfts: NftAssetDetail[]) {
  return nfts.map(
    (nft): DuckInfo => ({
      id: nft.assetId,
      vendor: NftVendor.Ducks,
    })
  );
}
