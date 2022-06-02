import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import { signArtApiUrl } from 'nfts/signArt/constants';

export interface SignArtInfo extends BaseInfo {
  vendor: NftVendor.SignArt;
  creator: string;
  name: string;
  description: string;
  cid: string;
}

export class SignArt extends BaseNft<SignArtInfo> {
  get creator(): string {
    return this.info.creator;
  }

  get displayCreator(): string {
    // todo: fetch creator name from contract
    return super.displayCreator;
  }

  get displayName(): string {
    return this.info.name;
  }

  get description(): string {
    return this.info.description;
  }

  get foreground(): string {
    return this.info.cid ? signArtApiUrl + this.info.cid : null;
  }
}
