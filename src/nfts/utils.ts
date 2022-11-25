import { DataTransactionEntry, Long } from '@waves/ts-types';
import { AssetDetail } from 'assets/types';
import { DucksArtefact, DucksArtefactInfo } from 'nfts/duckArtifacts';
import { ducksArtefactsDApp } from 'nfts/duckArtifacts/constants';
import { fetchAll as fetchAllArtefacts } from 'nfts/duckArtifacts/utils';
import { Duckling, DucklingInfo } from 'nfts/ducklings';
import { ducklingsDApp } from 'nfts/ducklings/constants';
import { fetchAll as fetchAllDucklings } from 'nfts/ducklings/utils';
import { Duck } from 'nfts/ducks';
import { ducksDApps } from 'nfts/ducks/constants';
import { DuckInfo, fetchAll as fetchAllDucks } from 'nfts/ducks/utils';
import { BaseNft, NftInfo, NftVendor } from 'nfts/index';
import { SignArt, SignArtInfo } from 'nfts/signArt';
import { signArtDApp } from 'nfts/signArt/constants';
import { fetchAll as fetchAllSignArts } from 'nfts/signArt/utils';
import { MyNFT, Unknown } from 'nfts/unknown';

import { NftConfig } from '../constants';
import { NftAssetDetail } from './types';

export type Nft = ReturnType<typeof createNft>;

export function createNft({
  asset,
  info,
  currentAddress,
  config,
}: {
  asset: AssetDetail;
  info: NftInfo | { id: string; vendor: NftVendor.Unknown } | null | undefined;
  currentAddress?: string;
  config: NftConfig;
}) {
  switch (nftType(asset)) {
    case NftVendor.Ducklings:
      return new Duckling({ asset, info: info as DucklingInfo, config });
    case NftVendor.Ducks:
      return new Duck({ asset, info: info as DuckInfo, config });
    case NftVendor.DucksArtefact:
      return new DucksArtefact({
        asset,
        info: info as DucksArtefactInfo,
        config,
      });
    case NftVendor.SignArt:
      return new SignArt({ asset, info: info as SignArtInfo, config });
    case NftVendor.Unknown: {
      if (asset.issuer === currentAddress) {
        return new MyNFT({ asset, config });
      }
      return new Unknown({ asset, config });
    }
    default:
      return new BaseNft({ asset, config });
  }
}

export function nftType(nft: { issuer: string }): NftVendor {
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

export async function fetchAllNfts(nodeUrl: string, nfts: NftAssetDetail[]) {
  const ducks: NftAssetDetail[] = [];
  const babyDucks: NftAssetDetail[] = [];
  const ducksArtefacts: NftAssetDetail[] = [];
  const signArts: NftAssetDetail[] = [];

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

  const allNfts = await Promise.all([
    fetchAllSignArts(nodeUrl, signArts).catch(() => []),
    fetchAllDucks(ducks),
    fetchAllArtefacts(ducksArtefacts),
    fetchAllDucklings(nodeUrl, babyDucks).catch(() => []),
  ]);

  return allNfts.flat();
}

export function capitalize(str: string): string {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function reduceDataEntries(entries: DataTransactionEntry[]) {
  return entries.reduce((data, item) => {
    data[item.key] = item.value;
    return data;
  }, {} as Record<string, boolean | Long | null | undefined>);
}
