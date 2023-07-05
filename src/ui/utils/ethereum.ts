import {
  isHexString,
  isValidAddress,
  isValidChecksumAddress,
} from '@ethereumjs/util';
import {
  base16Decode,
  base16Encode,
  base58Decode,
  base58Encode,
  blake2b,
  keccak,
} from '@keeper-wallet/waves-crypto';

export function fromWavesToEthereumAddress(address: string) {
  const bytes = base58Decode(address);
  return `0x${base16Encode(bytes.slice(2, bytes.length - 4))}`;
}

export function fromEthereumToWavesAddress(address: string, chainId = 87) {
  const hex = address.slice(2);
  const bytes = base16Decode(hex);
  const chainBytes = new Uint8Array([0x01, chainId]);
  const checksum = keccak(blake2b(new Uint8Array([...chainBytes, ...bytes])));
  return base58Encode(
    new Uint8Array([...chainBytes, ...bytes, ...checksum.slice(0, 4)]),
  );
}

export function isEthereumAddress(possibleAddress: string) {
  return isHexString(possibleAddress, 20);
}

export function isValidEthereumAddress(
  possibleAddress: string,
  { mixedCaseUseChecksum = false } = {},
) {
  if (!isEthereumAddress(possibleAddress)) {
    return false;
  }

  if (mixedCaseUseChecksum) {
    const prefixRemoved = possibleAddress.slice(2);
    const lower = prefixRemoved.toLowerCase();
    const upper = prefixRemoved.toUpperCase();
    const allOneCase = prefixRemoved === lower || prefixRemoved === upper;
    if (!allOneCase) {
      return isValidChecksumAddress(possibleAddress);
    }
  }

  return isValidAddress(possibleAddress);
}
