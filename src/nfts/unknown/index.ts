import { BaseInfo, BaseNft } from 'nfts/index';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const unknownLogo = require('../logos/unknown.svg');

export class Unknown extends BaseNft<BaseInfo> {
  get foreground(): string {
    return unknownLogo;
  }
}
