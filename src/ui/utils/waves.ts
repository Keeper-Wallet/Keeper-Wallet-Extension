import { SeedAdapter, TSignData } from '@waves/signature-adapter';
import * as SG from '@waves/signature-generator';
import { utils } from '@waves/signature-generator';
import { networks } from '../reducers/updateState';


export function networkByteFromAddress(address: string): string {
    const rawNetworkByte = SG.libs.base58.decode(address)[1];
    return String.fromCharCode(rawNetworkByte);
}

export function addressFromPublicKey(pk: string, byte: string): string {
    const publicKeyBytes = SG.libs.base58.decode(pk);
    const prefix = Uint8Array.from([SG.ADDRESS_VERSION, byte.charCodeAt(0)]);
    const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));
    const rawAddress = SG.utils.concatUint8Arrays(prefix, publicKeyHashPart);
    const addressHash = Uint8Array.from(hashChain(rawAddress).slice(0, 4));
    return SG.libs.base58.encode(SG.utils.concatUint8Arrays(rawAddress, addressHash));
}

export function encrypt(object, password: string): string {
    const jsonObj = JSON.stringify(object);
    return utils.crypto.encryptSeed(jsonObj, password)
}

export function decrypt<T>(encryptedText: string, password: string): T | never {
    try {
        const decryptedJson = utils.crypto.decryptSeed(encryptedText, password);
        return JSON.parse(decryptedJson)
    } catch (e) {
        throw new Error('Invalid password')
    }
}

export function getInitedAdapter(user, seed = 'validation seed'): SeedAdapter {
    SeedAdapter.initOptions({networkCode: user.networkCode.charCodeAt(0)});
    return new SeedAdapter('validation seed');
}

export async function getTxId(adapter: SeedAdapter, tx: TSignData): Promise<string> {
    return await adapter.makeSignable(tx).getId();
}

export async function getNetworkByte(url: string): Promise<string> {
    const response = await getUrl(url, 'blocks/last', true);
    const { generator } = await response.json();
    
    if (!generator) {
        throw new Error('Incorrect node url');
    }
    
    const networkCode = networkByteFromAddress(generator);
    
    if (!networkCode) {
        throw new Error('Incorrect node byte');
    }
    
    return networkCode;
}

export async function getMatcherPublicKey(url: string): Promise<string> {
    const response = await getUrl(url, '/matcher');
    const pk = await response.json();
    const publicKeyBytes = SG.libs.base58.decode(pk);
    if (publicKeyBytes.length === 32) {
        return pk;
    }
    
    throw new Error('Invalid matcher public key');
}

function blake2b(input): Uint8Array {
    return SG.libs.blake2b.blake2b(input, null, 32);
}

function keccak(input): Uint8Array {
    return SG.libs.keccak256.array(input);
}

function hashChain(input): Uint8Array {
    return keccak(blake2b(input));
}

async function getUrl(urlString: string, path = '', required = true): Promise<Response> {
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

export const validateNode = async (url: string, networkCode: string) => {
    const code = await getNetworkByte(url);
    
    if (networkCode && code !== networkCode) {
        throw new Error('Invalid code')
    }
    
    return code;
};
