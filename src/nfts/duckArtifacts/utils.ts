import { ArtefactNames } from 'nfts/duckArtifacts/constants';
import { NftDetails, NftVendor } from 'nfts/index';

export interface DucksArtefactInfo {
  id: string;
  vendor: NftVendor.DucksArtefact;
  creator: string;
  name: string;
  fgImage: string;
}

export async function fetchAll(
  nfts: NftDetails[]
): Promise<DucksArtefactInfo[]> {
  if (nfts.length === 0) {
    return [];
  }

  return nfts.map(nft => ({
    id: nft.assetId,
    vendor: NftVendor.DucksArtefact,
    creator: nft.issuer,
    name:
      ArtefactNames[nft.name.toLowerCase().replace(/-/, '_')]?.title ||
      nft.name,
    fgImage: `${nft.name}.svg`,
  }));
}
