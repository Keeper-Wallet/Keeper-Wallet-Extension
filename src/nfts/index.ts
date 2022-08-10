import * as React from 'react';
import { DuckInfo } from 'nfts/ducks/utils';
import { DucklingInfo } from 'nfts/ducklings';
import { DucksArtefactInfo } from 'nfts/duckArtifacts';
import { SignArtInfo } from 'nfts/signArt';
import { AssetDetail } from 'assets/types';
import { NftConfig } from '../constants';

export type NftInfo = DuckInfo | DucklingInfo | DucksArtefactInfo | SignArtInfo;

export enum DisplayMode {
  Name,
  Creator,
}

export enum NftVendor {
  My = 'my',
  Ducks = 'ducks',
  Ducklings = 'ducklings',
  DucksArtefact = 'ducks-artefact',
  SignArt = 'sign-art',
  Unknown = 'unknown',
}

export const NftVendorKeys = Object.values(NftVendor);

export interface BaseInfo {
  id: string;
  vendor: NftVendor;
}

export class BaseNft<TypedInfo extends BaseInfo> {
  protected asset: AssetDetail;
  protected info: TypedInfo | null;
  protected config: NftConfig;

  constructor({
    asset,
    info = null,
    config,
  }: {
    asset: AssetDetail;
    info?: TypedInfo | null;
    config: NftConfig;
  }) {
    this.asset = asset;
    this.info = info;
    this.config = config;
  }
  get foreground(): string | null {
    return null;
  }
  get background(): React.CSSProperties | null {
    return null;
  }
  get isVideo(): boolean {
    return this.foreground ? !!this.foreground.match(/\.mp4$/) : false;
  }
  get id(): AssetDetail['id'] {
    return this.asset.id;
  }
  get issuer(): AssetDetail['issuer'] {
    return this.asset.issuer;
  }
  get displayCreator() {
    return this.creator;
  }
  get creator(): string | null | undefined {
    return this.asset.issuer;
  }
  get creatorUrl(): string | null | undefined {
    return null;
  }
  get marketplaceUrl(): string | null | undefined {
    return null;
  }
  get vendor(): TypedInfo['vendor'] {
    return this.info?.vendor ?? NftVendor.Unknown;
  }
  get originTransactionId(): AssetDetail['originTransactionId'] {
    return this.asset.originTransactionId;
  }
  get displayName(): AssetDetail['displayName'] {
    return this.asset.displayName;
  }
  get name(): AssetDetail['name'] {
    return this.asset.name;
  }
  get precision(): AssetDetail['precision'] {
    return this.asset.precision;
  }
  get description(): AssetDetail['description'] | null {
    return this.asset.description;
  }
  get height(): AssetDetail['height'] {
    return this.asset.height;
  }
  get timestamp(): AssetDetail['timestamp'] {
    return this.asset.timestamp;
  }
  get sender(): AssetDetail['sender'] {
    return this.asset.sender;
  }
  get quantity(): AssetDetail['quantity'] {
    return this.asset.quantity;
  }
  get reissuable(): AssetDetail['reissuable'] {
    return false;
  }
  get hasScript(): AssetDetail['hasScript'] {
    return this.asset.hasScript;
  }
  get minSponsoredFee(): AssetDetail['minSponsoredFee'] {
    return this.asset.minSponsoredFee;
  }
}
