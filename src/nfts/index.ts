import { DucksArtefactInfo } from 'nfts/duckArtifacts';
import { DucklingInfo } from 'nfts/ducklings';
import { DuckInfo } from 'nfts/ducks/utils';
import { SignArtInfo } from 'nfts/signArt';

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
  readonly asset;
  protected info;
  protected config;

  constructor({
    asset,
    info,
    config,
  }: {
    asset: {
      description: string;
      displayName: string;
      id: string;
      issuer: string;
      name: string;
    };
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

  get id(): string {
    return this.asset.id;
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

  get vendor(): NftVendor {
    return this.info?.vendor ?? NftVendor.Unknown;
  }

  get displayName(): string {
    return this.asset.displayName;
  }

  get name() {
    return this.asset.name;
  }

  get description(): string | null {
    return this.asset.description;
  }
}
