import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import { signArtApiUrl } from 'nfts/signArt/constants';

export interface SignArtInfo extends BaseInfo {
  vendor: NftVendor.SignArt;
  creator: string;
  userName: string;
  name: string;
  description: string;
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

  get displayName(): string {
    return this.info.name || super.displayName;
  }

  get description(): string {
    return this.info.description || super.description;
  }

  get foreground(): string {
    return this.info.cid ? signArtApiUrl + this.info.cid : null;
  }
}
