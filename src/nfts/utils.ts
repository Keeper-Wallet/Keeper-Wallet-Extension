import { AssetDetail } from 'ui/services/Background';
import { fetchAllSignArts, SignArtInfo } from 'nfts/signArt/utils';
import { DuckInfo, fetchAllDucks } from 'nfts/ducks/utils';
import {
  BabyDuckInfo,
  fetchAll as fetchAllBabyDucks,
} from 'nfts/babyDucks/utils';

import { signArtDApp } from 'nfts/signArt/constants';
import { ducksDApps } from 'nfts/ducks/constants';
import { BigNumber } from '@waves/bignumber';
import { NftDetails } from 'controllers/NftInfoController';
import { babyDucksDApp } from 'nfts/babyDucks/constants';
import { ducksArtefactsDApp } from 'nfts/duckArtifacts/constants';
import { fetchAll as fetchAllArtefacts } from 'nfts/duckArtifacts/utils';

export enum NFT {
  Ducks = 'ducks',
  BabyDucks = 'baby-ducks',
  DucksArtefact = 'ducks-artefact',
  SignArt = 'sign-art',
  Unknown = 'unknown',
}

export function isNFT({ quantity, precision, reissuable }: AssetDetail) {
  const nftQuantity = new BigNumber(quantity).eq(1);
  const nftPrecision = new BigNumber(precision || 0).eq(0);
  return !reissuable && nftPrecision && nftQuantity;
}

export function nftType(nft: AssetDetail): NFT {
  if (!nft) {
    return null;
  }
  if (nft?.issuer === signArtDApp) {
    return NFT.SignArt;
  }
  if (ducksDApps.includes(nft?.issuer)) {
    return NFT.Ducks;
  }

  if (nft?.issuer === babyDucksDApp) {
    return NFT.BabyDucks;
  }

  if (nft?.issuer === ducksArtefactsDApp) {
    return NFT.DucksArtefact;
  }

  return NFT.Unknown;
}

export async function fetchAllNfts(
  nfts: NftDetails[]
): Promise<Array<DuckInfo | BabyDuckInfo | SignArtInfo>> {
  const ducks = [];
  const babyDucks = [];
  const ducksArtefacts = [];
  const signArts = [];

  for (const nft of nfts) {
    switch (this.nftType(nft)) {
      case NFT.Ducks:
        ducks.push(nft);
        break;
      case NFT.BabyDucks:
        babyDucks.push(nft);
        break;
      case NFT.DucksArtefact:
        ducksArtefacts.push(nft);
        break;
      case NFT.SignArt:
        signArts.push(nft);
        break;
    }
  }

  return Array.prototype.flat.call(
    await Promise.all([
      fetchAllSignArts(signArts).catch(() => []),
      fetchAllDucks(ducks).catch(() => []),
      fetchAllArtefacts(ducksArtefacts).catch(() => []),
      fetchAllBabyDucks(babyDucks).catch(() => []),
    ])
  );
}
