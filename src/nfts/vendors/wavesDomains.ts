import {
  type CreateParams,
  type FetchInfoParams,
  type Nft,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';

const WAVES_DOMAINS_DAPP = '3P6utP25F4wMUGG4hGdDtMXMKu2tTeNkgRs';

interface WavesDomainsNftInfo {
  id: string;
  vendor: NftVendorId.WavesDomains;
}

export class WavesDomainsNftVendor implements NftVendor<WavesDomainsNftInfo> {
  id = NftVendorId.WavesDomains as const;

  is(nft: NftAssetDetail) {
    return nft.issuer === WAVES_DOMAINS_DAPP;
  }

  fetchInfo({ nfts }: FetchInfoParams) {
    return nfts.map(
      (nft): WavesDomainsNftInfo => ({
        id: nft.assetId,
        vendor: NftVendorId.WavesDomains,
      }),
    );
  }

  create({ asset }: CreateParams<WavesDomainsNftInfo>): Nft {
    return {
      creator: asset.issuer,
      creatorUrl: 'https://waves.domains',
      description: 'Decentralized naming protocol for Waves ecosystem',
      displayCreator: 'Waves Domains',
      displayName: asset.description,
      foreground: `https://app.waves.domains/api/v1/nft-img/${asset.id}`,
      id: asset.id,
      marketplaceUrl: `https://app.waves.domains?q=${asset.description.replace(
        /\.waves$/,
        '',
      )}`,
      name: asset.description,
      vendor: NftVendorId.WavesDomains,
    };
  }
}
