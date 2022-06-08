import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';

export interface SignArtInfo extends BaseInfo {
  vendor: NftVendor.SignArt;
  creator: string;
  userName: string;
  name: string;
  description: string;
  artworkId: string;
  cid: string;
}

export class SignArt extends BaseNft<SignArtInfo> {
  get creator(): string {
    return this.info.creator;
  }

  get displayCreator(): string {
    return this.info.userName ? `@${this.info.userName}` : super.displayCreator;
  }

  get creatorUrl(): string {
    return `https://mainnet.sign-art.app/user/${this.creator}`;
  }

  get marketplaceUrl(): string {
    return `https://mainnet.sign-art.app/user/${this.creator}/artwork/${this.info.artworkId}`;
  }

  get displayName(): string {
    return this.info.name || super.displayName;
  }

  get description(): string {
    return this.info.description || super.description;
  }

  get foreground(): string {
    return this.info.cid ? `https://ipfs.io/ipfs/${this.info.cid}` : null;
  }
}
