import { NftDetails } from 'controllers/NftInfoController';
import { NFT } from 'nfts/utils';

export interface BabyDuckInfo {
  id: string;
  vendor: NFT.BabyDucks;
  creator: string;
  name: string;
  fgImage: string;
}

export async function fetchAll(nfts: NftDetails[]): Promise<BabyDuckInfo[]> {
  if (nfts.length === 0) {
    return [];
  }

  return nfts.map(nft => ({
    id: nft.assetId,
    creator: nft.issuer,
    vendor: NFT.BabyDucks,
    name: nft.name,
    fgImage: `duckling-0.svg`,
  }));
}
