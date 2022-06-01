import { AssetDetail } from 'ui/services/Background';
import { fetchAllSignArts, SignArtInfo } from 'nfts/signArt/utils';
import { DuckInfo, fetchAllDucks } from 'nfts/ducks/utils';
import {
  DucklingInfo,
  fetchAll as fetchAllDucklings,
} from 'nfts/ducklings/utils';

import { signArtDApp } from 'nfts/signArt/constants';
import { ducksDApps } from 'nfts/ducks/constants';
import { ducklingsDApp } from 'nfts/ducklings/constants';
import { ducksArtefactsDApp } from 'nfts/duckArtifacts/constants';
import { fetchAll as fetchAllArtefacts } from 'nfts/duckArtifacts/utils';
import { NftDetails, NftVendor } from 'nfts/index';

export function nftType(nft: AssetDetail): NftVendor {
  if (!nft) {
    return null;
  }
  if (nft?.issuer === signArtDApp) {
    return NftVendor.SignArt;
  }
  if (ducksDApps.includes(nft?.issuer)) {
    return NftVendor.Ducks;
  }

  if (nft?.issuer === ducklingsDApp) {
    return NftVendor.Ducklings;
  }

  if (nft?.issuer === ducksArtefactsDApp) {
    return NftVendor.DucksArtefact;
  }

  return NftVendor.Unknown;
}

export async function fetchAllNfts(
  nfts: NftDetails[]
): Promise<Array<DuckInfo | DucklingInfo | SignArtInfo>> {
  const ducks = [];
  const babyDucks = [];
  const ducksArtefacts = [];
  const signArts = [];

  for (const nft of nfts) {
    switch (this.nftType(nft)) {
      case NftVendor.Ducks:
        ducks.push(nft);
        break;
      case NftVendor.Ducklings:
        babyDucks.push(nft);
        break;
      case NftVendor.DucksArtefact:
        ducksArtefacts.push(nft);
        break;
      case NftVendor.SignArt:
        signArts.push(nft);
        break;
    }
  }

  return Array.prototype.flat.call(
    await Promise.all([
      fetchAllSignArts(signArts).catch(() => []),
      fetchAllDucks(ducks).catch(() => []),
      fetchAllArtefacts(ducksArtefacts).catch(() => []),
      fetchAllDucklings(babyDucks).catch(() => []),
    ])
  );
}
