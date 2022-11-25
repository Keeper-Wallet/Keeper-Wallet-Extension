import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';

export class Unknown extends BaseNft<BaseInfo> {
  get foreground(): string {
    return new URL('../logos/unknown.svg', import.meta.url).toString();
  }
}

export class MyNFT extends Unknown {
  get vendor(): NftVendor.My {
    return NftVendor.My;
  }

  get displayCreator(): string {
    return 'My NFTs';
  }
}
