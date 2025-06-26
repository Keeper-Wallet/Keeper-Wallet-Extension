import {
    base58Encode,
    createAddress,
    createPublicKey
} from '@keeper-wallet/waves-crypto';
import { edwardsToMontgomeryPriv } from '@noble/curves/ed25519';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';
import { mnemonicToSeedSync } from '@scure/bip39';
import { Mnemonic, Wallet } from 'ethers';
export {
    createPublicKey,
    signBytes,
    verifySignature
} from '@keeper-wallet/waves-crypto';

interface Keys {
  privateKey: Uint8Array;
  chainCode: Uint8Array;
}

const pathRegex = new RegExp("^m(\\/[0-9]+')+$");

const ED25519_CURVE = 'ed25519 seed';
const HARDENED_OFFSET = 0x80000000;
const WAVES_COIN_PATH = `m/44'/5741564'/0'/0'/0'`;

function replaceDerive(val: string): string {
  return val.replace("'", '');
}

function getMasterKey(seed: Uint8Array): Keys {
  const I = hmac.create(sha512, ED25519_CURVE).update(seed).digest();
  const IL = I.slice(0, 32);
  const IR = I.slice(32);
  return {
    privateKey: IL,
    chainCode: IR,
  };
}

function deriveChild({ privateKey, chainCode }: Keys, index: number): Keys {
  const indexBuffer = new Uint8Array(4);
  new DataView(indexBuffer.buffer).setUint32(0, index, false);

  const data = new Uint8Array([
    ...Uint8Array.from([0]),
    ...privateKey,
    ...indexBuffer,
  ]);

  const I = hmac.create(sha512, chainCode).update(data).digest();
  const IL = I.slice(0, 32);
  const IR = I.slice(32);

  return {
    privateKey: IL,
    chainCode: IR,
  };
}

function isValidPath(path: string): boolean {
  if (!pathRegex.test(path)) {
    return false;
  }

  return !path.split('/').slice(1).map(replaceDerive).some(Number.isNaN);
}

function derivePath(
  seed: Uint8Array,
  path: string = WAVES_COIN_PATH,
  offset = HARDENED_OFFSET,
): Keys {
  if (!isValidPath(path)) {
    throw new Error('Invalid derivation path');
  }

  const { privateKey, chainCode } = getMasterKey(seed);

  const segments = path
    .split('/')
    .slice(1)
    .map(replaceDerive)
    .map(el => parseInt(el, 10));

  return segments.reduce(
    (parentKeys, segment) => deriveChild(parentKeys, segment + offset),
    { privateKey, chainCode },
  );
}

export function createPrivateKeyMultichain(phrase: string) {
  const { privateKey } = derivePath(mnemonicToSeedSync(phrase));

  return edwardsToMontgomeryPriv(privateKey);
}

export interface AccountData {
  address: string;
  publicKey: string;
}

export interface WavesAccountData extends AccountData {}
export interface EthereumAccountData extends AccountData {}

export async function getWavesData(seed: string, chainId: number = 87): Promise<WavesAccountData> {
  try {
    const publicKeyBytes = await createPublicKey(createPrivateKeyMultichain(seed));
    const addressBytes = createAddress(publicKeyBytes, chainId);
    return {
      address: base58Encode(addressBytes),
      publicKey: base58Encode(publicKeyBytes),
    };
  } catch {
    return {
      address: '',
      publicKey: '',
    };
  }
}

export function getEthereumData(seed: string): EthereumAccountData {
  try {
    const wallet = Mnemonic.isValidMnemonic(seed)
      ? Wallet.fromPhrase(seed)
      : null;
    if (!wallet) return { address: '', publicKey: '' };
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
    };
  } catch {
    return {
      address: '',
      publicKey: '',
    };
  }
}

export interface MultichainAccountData {
  waves: WavesAccountData;
  ethereum: EthereumAccountData;
}

export async function createMultichainAccountData(seed: string, wavesChainId?: number): Promise<MultichainAccountData> {
  const waves = await getWavesData(seed, wavesChainId);
  const ethereum = getEthereumData(seed);
  
  return {
    waves,
    ethereum,
  };
}
