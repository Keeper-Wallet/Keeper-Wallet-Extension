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

export enum NFT {
  Ducks = 'ducks',
  BabyDucks = 'baby-ducks',
  DucksArtifact = 'ducks-artifact',
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
    return NFT.DucksArtifact;
  }

  return NFT.Unknown;
}

export async function fetchAllNfts(
  nfts: NftDetails[]
): Promise<Array<DuckInfo | BabyDuckInfo | SignArtInfo>> {
  const ducks = [];
  const babyDucks = [];
  const signArts = [];

  for (const nft of nfts) {
    switch (this.nftType(nft)) {
      case NFT.Ducks:
        ducks.push(nft);
        break;
      case NFT.BabyDucks:
        babyDucks.push(nft);
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
      fetchAllBabyDucks(babyDucks).catch(() => []),
    ])
  );
}
