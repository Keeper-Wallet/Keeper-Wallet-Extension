import { AssetDetail } from 'ui/services/Background';
import {
  fetchAllSignArts,
  fetchSignArt as getSignArtInfo,
  SignArtInfo,
} from 'nfts/signArt/utils';
import {
  DuckInfo,
  fetchAllDucks,
  fetchDuck as getDucksInfo,
} from 'nfts/ducks/utils';
import { signArtDApp } from 'nfts/signArt/constants';
import { ducksDApps } from 'nfts/ducks/constants';
import { BigNumber } from '@waves/bignumber';
import { NftDetails } from 'controllers/NftInfoController';

type NftType = 'ducks' | 'sign-art' | 'unknown';

export function isNFT({ quantity, precision, reissuable }: AssetDetail) {
  const nftQuantity = new BigNumber(quantity).eq(1);
  const nftPrecision = new BigNumber(precision || 0).eq(0);
  return !reissuable && nftPrecision && nftQuantity;
}

export function nftType(nft: AssetDetail): NftType {
  if (!nft) {
    return null;
  }
  if (nft?.issuer === signArtDApp) {
    return 'sign-art';
  }
  if (ducksDApps.includes(nft?.issuer)) {
    return 'ducks';
  }

  return 'unknown';
}

export async function fetchNftInfo(
  nft: NftDetails
): Promise<SignArtInfo | DuckInfo | null> {
  switch (this.nftType(nft)) {
    case 'ducks':
      return getDucksInfo(nft);
    case 'sign-art':
      return getSignArtInfo(nft);
  }
}

export async function fetchAllNfts(
  nfts: NftDetails[]
): Promise<Array<DuckInfo | SignArtInfo>> {
  const ducks = [];
  const signArts = [];

  for (const nft of nfts) {
    switch (this.nftType(nft)) {
      case 'ducks':
        ducks.push(nft);
        break;
      case 'sign-art':
        signArts.push(nft);
        break;
    }
  }

  return Array.prototype.flat.call(
    await Promise.all([fetchAllSignArts(signArts), fetchAllDucks(ducks)])
  );
}
