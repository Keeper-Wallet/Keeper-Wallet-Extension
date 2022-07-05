import { NftDetails, NftVendor } from 'nfts/index';
import { DucksArtefactInfo } from 'nfts/duckArtifacts/index';

export async function fetchAll(
  nfts: NftDetails[]
): Promise<DucksArtefactInfo[]> {
  if (nfts.length === 0) {
    return [];
  }

  return nfts.map(nft => ({
    id: nft.assetId,
    vendor: NftVendor.DucksArtefact,
  }));
}
