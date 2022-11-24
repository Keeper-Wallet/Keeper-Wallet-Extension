import { DucksArtefactInfo } from 'nfts/duckArtifacts/index';
import { NftVendor } from 'nfts/index';

export async function fetchAll(
  nfts: Array<{ assetId: string }>
): Promise<DucksArtefactInfo[]> {
  if (nfts.length === 0) {
    return [];
  }

  return nfts.map(nft => ({
    id: nft.assetId,
    vendor: NftVendor.DucksArtefact,
  }));
}
