import { AssetDetail } from 'assets/types';

import { NftConfig } from '../constants';
import { Nft, NftAssetDetail, NftVendor, NftVendorId } from './types';
import { DucklingsNftVendor } from './vendors/ducklings';
import { DucksNftVendor } from './vendors/ducks';
import { DucksArtefactsNftVendor } from './vendors/ducksArtefacts';
import { SignArtNftVendor } from './vendors/signArt';

const vendors = {
  [NftVendorId.DucksArtefact]: new DucksArtefactsNftVendor(),
  [NftVendorId.Ducklings]: new DucklingsNftVendor(),
  [NftVendorId.Ducks]: new DucksNftVendor(),
  [NftVendorId.SignArt]: new SignArtNftVendor(),
};

export type NftInfo = typeof vendors[keyof typeof vendors] extends NftVendor<
  infer T
>
  ? T
  : never;

export async function fetchNftInfo(nodeUrl: string, nfts: NftAssetDetail[]) {
  const allNfts = await Promise.all(
    Object.values(vendors).map(vendor =>
      vendor.fetchInfo({ nodeUrl, nfts: nfts.filter(vendor.is) })
    )
  );

  return allNfts.flat();
}

export function createNft({
  asset,
  config,
  info,
  userAddress,
}: {
  asset: AssetDetail;
  config: NftConfig;
  info: NftInfo | undefined;
  userAddress: string;
}): Nft {
  return Object.values(vendors).reduce<Nft>(
    (result, vendor) =>
      info?.vendor === vendor.id
        ? vendor.create({
            asset,
            config,
            info: info as never,
          })
        : result,
    {
      creator: asset.issuer,
      description: asset.description,
      displayCreator: asset.issuer === userAddress ? 'My NFTs' : asset.issuer,
      displayName: asset.displayName,
      foreground: new URL('./unknown.svg', import.meta.url).toString(),
      id: asset.id,
      name: asset.name,
      vendor: NftVendorId.Unknown,
    }
  );
}
