import { base58Decode } from '@waves/ts-lib-crypto';

export function networkByteFromAddress(address: string) {
  return String.fromCharCode(base58Decode(address)[1]);
}
