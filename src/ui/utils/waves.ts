import { base58Decode } from '@keeper-wallet/waves-crypto';
import { NetworkName } from 'networks/types';

function getNetworkCodeByAddress(address: string): string {
  return String.fromCharCode(base58Decode(address)[1]);
}

export function getNetworkByNetworkCode(networkCode: string): NetworkName {
  switch (networkCode) {
    case 'S':
      return NetworkName.Stagenet;
    case 'T':
      return NetworkName.Testnet;
    case 'W':
      return NetworkName.Mainnet;
    default:
      return NetworkName.Custom;
  }
}

export function getNetworkByAddress(address: string): NetworkName {
  return getNetworkByNetworkCode(getNetworkCodeByAddress(address));
}

export async function getNetworkCode(url: string) {
  const response = await fetch(new URL('/blocks/headers/last', url));

  if (!response.ok) {
    throw response;
  }

  const { generator }: { generator: string } = await response.json();

  if (!generator) {
    throw new Error('Incorrect node url');
  }

  const networkCode = getNetworkCodeByAddress(generator);

  if (!networkCode) {
    throw new Error('Incorrect node byte');
  }

  return networkCode;
}

export async function getMatcherPublicKey(url: string) {
  const response = await fetch(new URL('/matcher', url));

  if (!response.ok) {
    throw response;
  }

  const publicKey = (await response.json()) as string;

  if (base58Decode(publicKey).length !== 32) {
    throw new Error('Invalid matcher public key');
  }

  return publicKey;
}
