import { BaseInfo, NftVendor } from 'nfts/index';

export interface DuckInfo extends BaseInfo {
  vendor: NftVendor.Ducks;
}

export async function fetchAll(
  nfts: Array<{ assetId: string }>
): Promise<Array<DuckInfo | null>> {
  if (nfts.length === 0) {
    return [];
  }
  return Promise.all(
    nfts.map(
      async (nft): Promise<DuckInfo | null> => ({
        id: nft.assetId,
        vendor: NftVendor.Ducks,
      })
    )
  );
}