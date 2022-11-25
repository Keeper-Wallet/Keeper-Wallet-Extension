import { DucksArtefactInfo } from 'nfts/duckArtifacts/index';
import { NftVendor } from 'nfts/index';
import { NftAssetDetail } from 'nfts/types';

export function fetchAll(nfts: NftAssetDetail[]) {
  return nfts.map(
    (nft): DucksArtefactInfo => ({
      id: nft.assetId,
      vendor: NftVendor.DucksArtefact,
    })
  );
}
