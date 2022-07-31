import { AssetDetail } from 'ui/services/Background';
import { fetchAll as fetchAllSignArts } from 'nfts/signArt/utils';
import { DuckInfo, fetchAll as fetchAllDucks } from 'nfts/ducks/utils';
import { fetchAll as fetchAllDucklings } from 'nfts/ducklings/utils';

import { signArtDApp } from 'nfts/signArt/constants';
import { ducksDApps } from 'nfts/ducks/constants';
import { ducklingsDApp } from 'nfts/ducklings/constants';
import { ducksArtefactsDApp } from 'nfts/duckArtifacts/constants';
import { fetchAll as fetchAllArtefacts } from 'nfts/duckArtifacts/utils';
import { BaseNft, NftDetails, NftInfo, NftVendor } from 'nfts/index';
import { Duckling, DucklingInfo } from 'nfts/ducklings';
import { Duck } from 'nfts/ducks';
import { SignArt, SignArtInfo } from 'nfts/signArt';
import { DucksArtefact } from 'nfts/duckArtifacts';
import { MyNFT, Unknown } from 'nfts/unknown';
import { DataTransactionEntry } from '@waves/ts-types';

export type Nft = ReturnType<typeof createNft>;

export function createNft(
  asset: AssetDetail,
  info: NftInfo | { id: string; vendor: NftVendor.Unknown },
  currentAccount?: string
) {
  switch (nftType(asset)) {
    case NftVendor.Ducklings:
      return new Duckling(asset, info as DucklingInfo);
    case NftVendor.Ducks:
      return new Duck(asset, info as DuckInfo);
    case NftVendor.DucksArtefact:
      return new DucksArtefact(asset, info as DucksArtefact);
    case NftVendor.SignArt:
      return new SignArt(asset, info as SignArtInfo);
    case NftVendor.Unknown: {
      if (asset.issuer === currentAccount) {
        return new MyNFT(asset);
      }
      return new Unknown(asset);
    }
    default:
      return new BaseNft(asset);
  }
}

export function nftType(nft: AssetDetail): NftVendor {
  if (nft.issuer === signArtDApp) {
    return NftVendor.SignArt;
  }
  if (ducksDApps.includes(nft.issuer)) {
    return NftVendor.Ducks;
  }
  if (nft.issuer === ducklingsDApp) {
    return NftVendor.Ducklings;
  }
  if (nft.issuer === ducksArtefactsDApp) {
    return NftVendor.DucksArtefact;
  }
  return NftVendor.Unknown;
}

export async function fetchAllNfts(
  nodeUrl: string,
  nfts: NftDetails[]
): Promise<Array<NftInfo>> {
  const ducks = [];
  const babyDucks = [];
  const ducksArtefacts = [];
  const signArts = [];

  for (const nft of nfts) {
    switch (nftType(nft)) {
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
      fetchAllSignArts(nodeUrl, signArts).catch(() => []),
      fetchAllDucks(ducks).catch(() => []),
      fetchAllArtefacts(ducksArtefacts).catch(() => []),
      fetchAllDucklings(nodeUrl, babyDucks).catch(() => []),
    ])
  );
}

export function capitalize(str: string): string {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function reduceDataEntries(entries: Array<DataTransactionEntry>) {
  return entries.reduce((data, item) => {
    data[item.key] = item.value;
    return data;
  }, {});
}
