import { NftDetails } from 'controllers/NftInfoController';
import { NFT } from 'nfts/utils';
import { ArtefactNames } from 'nfts/duckArtifacts/constants';

export interface DucksArtefactInfo {
  id: string;
  vendor: NFT.DucksArtefact;
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
    vendor: NFT.DucksArtefact,
    creator: nft.issuer,
    name:
      ArtefactNames[nft.name.toLowerCase().replace(/-/, '_')]?.title ||
      nft.name,
    fgImage: `${nft.name}.svg`,
  }));
}
