import { type AssetDetail } from 'assets/types';

import { type NftConfig } from '../constants';

export interface NftAssetDetail {
  assetId: string;
  decimals: 0;
  description: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  minSponsoredAssetFee: null;
  name: string;
  originTransactionId: string;
  quantity: '1';
  reissuable: false;
  scripted: boolean;
  tokenId?: string;
}

export enum NftVendorId {
  Ducklings = 'ducklings',
  Ducks = 'ducks',
  DucksArtefact = 'ducks-artefact',
  SignArt = 'sign-art',
  WavesDomains = 'waves-domains',
  Puzzle = 'puzzle',
  Unit0 = 'unit0',
  Unknown = 'unknown',
}

export interface Nft {
  background?: React.CSSProperties;
  creator?: string;
  creatorUrl?: string;
  description?: string;
  displayCreator?: string;
  displayName: string;
  foreground?: string;
  id: string;
  marketplaceUrl?: string;
  name: string;
  tokenType?: string;
  vendor: NftVendorId;
  tokenId?: string;
  assetId?: string;
}

export interface FetchInfoParams {
  nfts: NftAssetDetail[];
  nodeUrl: string;
}

export interface CreateParams<T extends { vendor: NftVendorId }> {
  asset: AssetDetail;
  config: NftConfig;
  info: T;
  networkCode?: string;
}

export interface NftVendor<T extends { vendor: NftVendorId }> {
  id: T['vendor'];
  is(nft: NftAssetDetail): boolean;
  fetchInfo(params: FetchInfoParams): T[] | Promise<T[]>;
  create(params: CreateParams<T>): Nft;
}

export enum DisplayMode {
  Name,
  Creator,
}
