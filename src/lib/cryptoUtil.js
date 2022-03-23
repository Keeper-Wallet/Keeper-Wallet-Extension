import { libs } from '@waves/waves-transactions';

export function networkByteFromAddress(address) {
  const rawNetworkByte = libs.crypto.base58Decode(address).slice(1, 2);
  return String.fromCharCode(rawNetworkByte);
}
