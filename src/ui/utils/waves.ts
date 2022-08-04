import { libs } from '@waves/waves-transactions';
import { NetworkName } from 'networks/types';

function getNetworkByteByAddress(address: string): string {
  return String.fromCharCode(libs.crypto.base58Decode(address)[1]);
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
  return getNetworkByNetworkCode(getNetworkByteByAddress(address));
}

export async function getNetworkByte(url: string): Promise<string> {
  const response = await getUrl(url, '/blocks/headers/last', true);
  const { generator } = await response.json();

  if (!generator) {
    throw new Error('Incorrect node url');
  }

  const networkCode = getNetworkByteByAddress(generator);

  if (!networkCode) {
    throw new Error('Incorrect node byte');
  }

  return networkCode;
}

export async function getMatcherPublicKey(url: string): Promise<string> {
  const response = await getUrl(url, '/matcher');
  const pk = await response.json();
  const publicKeyBytes = libs.crypto.base58Decode(pk);
  if (publicKeyBytes.length === 32) {
    return pk;
  }

  throw new Error('Invalid matcher public key');
}

async function getUrl(
  urlString: string,
  path = '',
  required = true
): Promise<Response> {
  let url: URL;

  if (required && !urlString) {
    return Promise.reject();
  }

  try {
    url = new URL(urlString);
  } catch (e) {
    return Promise.reject();
  }

  url.pathname = path || url.pathname;

  return fetch(url.href);
}

function byteArrayToString(bytes: Uint8Array): string | null {
  const extraByteMap = [1, 1, 1, 1, 2, 2, 3, 0];
  const count = bytes.length;
  let str = '';

  for (let index = 0; index < count; ) {
    let ch = bytes[index++];
    if (ch & 0x80) {
      let extra = extraByteMap[(ch >> 3) & 0x07];
      if (!(ch & 0x40) || !extra || index + extra > count) return null;

      ch = ch & (0x3f >> extra);
      for (; extra > 0; extra -= 1) {
        const chx = bytes[index++];
        if ((chx & 0xc0) != 0x80) return null;

        ch = (ch << 6) | (chx & 0x3f);
      }
    }

    str += String.fromCharCode(ch);
  }

  return str;
}

const bytesToBase58 = libs.crypto.base58Encode;
const bytesToString = byteArrayToString;

export function readAttachment(data: Uint8Array | string | null | undefined) {
  if (!data) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  return bytesToString(data) ?? `base58:${bytesToBase58(data)}`;
}
