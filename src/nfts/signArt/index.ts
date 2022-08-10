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
  get creator() {
    if (!this.info) {
      const match = super.description?.match(/creator: (\w+)/i);
      return match && match[1];
    }

    return this.info.creator;
  }

  get displayCreator() {
    return this.info?.userName ? `@${this.info.userName}` : this.creator;
  }

  get creatorUrl() {
    return this.creator && `https://mainnet.sign-art.app/user/${this.creator}`;
  }

  get marketplaceUrl() {
    let artworkId: string | null | undefined = this.info?.artworkId;

    if (!this.info) {
      const match = super.description?.match(/artid: (\w+)/i);
      artworkId = match && match[1];
    }

    return (
      this.creator &&
      artworkId &&
      `https://mainnet.sign-art.app/user/${this.creator}/artwork/${artworkId}`
    );
  }

  get displayName() {
    return this.info?.name ?? super.displayName;
  }

  get description() {
    return this.info?.description ?? super.description;
  }

  get foreground() {
    if (!this.info?.cid) return null;

    if (!this.config) return null;

    const [domain, filename] = this.info.cid.split('/');

    return this.config.signArtImgUrl
      .replace(/{domain}/g, domain)
      .replace(/{filename}/g, filename);
  }
}
