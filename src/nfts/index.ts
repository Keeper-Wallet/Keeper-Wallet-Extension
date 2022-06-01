import { AssetDetail } from 'ui/services/Background';

export enum NftVendor {
  Ducks = 'ducks',
  Ducklings = 'ducklings',
  DucksArtefact = 'ducks-artefact',
  SignArt = 'sign-art',
  Unknown = 'unknown',
}

export type NftDetails = AssetDetail & { assetId: string };

export interface BaseInfo {
  id: string;
  vendor: NftVendor;
  creator: string;
  name: string;
  fgImage: string;
}

export abstract class AbcNftInfo<TypedInfo extends BaseInfo>
  implements AssetDetail
{
  protected asset: AssetDetail;
  protected info: TypedInfo;

  protected constructor(asset: AssetDetail, info: TypedInfo | null) {
    this.asset = asset;
    this.info = info;
  }
  get foreground(): string {
    return this.info.fgImage;
  }
  get background(): CSSStyleDeclaration | null {
    return null;
  }
  get isVideo(): boolean {
    return !!this.info.fgImage.match(/\.mp4$/);
  }
  get id(): AssetDetail['id'] {
    return this.asset.id;
  }
  get issuer(): AssetDetail['issuer'] {
    return this.asset.issuer;
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
    return 1;
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
