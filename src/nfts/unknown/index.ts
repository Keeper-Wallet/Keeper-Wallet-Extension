import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const unknownLogo = require('../logos/unknown.svg');

export class Unknown extends BaseNft<BaseInfo> {
  get foreground(): string {
    return unknownLogo;
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
