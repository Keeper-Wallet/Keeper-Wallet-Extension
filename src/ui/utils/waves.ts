import { SeedAdapter, TSignData } from '@waves/signature-adapter';
import { seedUtils, libs } from '@waves/waves-transactions';

import { pipe, identity, isNil, ifElse, concat } from 'ramda';

export function networkByteFromAddress(address: string): string {
    return String.fromCharCode(libs.crypto.base58Decode(address)[1]);
}

export function getExplorerUrls(network: string, address: string) {
    
    const result = {
        walletLink: null,
        activeAddressLink: null,
    };
    
    switch (network) {
        case 'mainnet':
            result.walletLink = 'https://waves.exchange/import/waveskeeper';
            result.activeAddressLink = `https://wavesexplorer.com/address/${address}`;
            break;
        case 'testnet':
            result.walletLink = 'https://testnet.wavesplatform.com/import/waveskeeper';
            result.activeAddressLink = `https://wavesexplorer.com/testnet/address/${address}`;
            break;
        case 'stagenet':
            result.walletLink = 'https://stagenet.wavesplatform.com/import/waveskeeper';
            result.activeAddressLink = `https://wavesexplorer.com/stagenet/address/${address}`;
            break;
        default:
            result.walletLink = 'https://waves.exchange/import/waveskeeper';
            result.activeAddressLink = `https://wavesexplorer.com/address/${address}`;
    }
    
    return result;
}

export function addressFromPublicKey(pk: string, byte: string): string {
    return new seedUtils.Seed(pk, byte).address
}

export function encrypt(object, password: string): string {
    const jsonObj = JSON.stringify(object);
    return seedUtils.encryptSeed(jsonObj, password)
}

export function decrypt<T>(encryptedText: string, password: string): T | never {
    try {
        const decryptedJson = seedUtils.decryptSeed(encryptedText, password);
        return JSON.parse(decryptedJson)
    } catch (e) {
        throw new Error('Invalid password')
    }
}

export function getInitedAdapter(user, seed = 'validation seed'): SeedAdapter {
    SeedAdapter.initOptions({networkCode: user.networkCode.charCodeAt(0)});
    return new SeedAdapter('validation seed', user.networkCode);
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
    const publicKeyBytes = libs.crypto.base58Decode(pk);
    if (publicKeyBytes.length === 32) {
        return pk;
    }
    
    throw new Error('Invalid matcher public key');
}

function blake2b(input): Uint8Array {
    return libs.crypto.blake2b(input);
}

function keccak(input): Uint8Array {
    return libs.crypto.keccak(input);
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

export const byteArrayToString = function (bytes: Uint8Array): string {
    const extraByteMap = [1, 1, 1, 1, 2, 2, 3, 0];
    const count = bytes.length;
    let str = '';
    
    for (let index = 0; index < count;) {
        let ch = bytes[index++];
        if (ch & 0x80) {
            let extra = extraByteMap[(ch >> 3) & 0x07];
            if (!(ch & 0x40) || !extra || ((index + extra) > count))
                return null;
            
            ch = ch & (0x3F >> extra);
            for (; extra > 0; extra -= 1) {
                const chx = bytes[index++];
                if ((chx & 0xC0) != 0x80)
                    return null;
                
                ch = (ch << 6) | (chx & 0x3F);
            }
        }
        
        str += String.fromCharCode(ch);
    }
    
    return str;
};


const bytesToBase58 = libs.crypto.base58Encode;
const bytesToString = byteArrayToString;

export const bytesToSafeString = ifElse(
    pipe(
        identity,
        bytesToString,
        isNil,
    ),
    pipe(
        identity,
        bytesToBase58,
        concat('base58:')
    ),
    pipe(
        identity,
        bytesToString
    )
);

export const readAttachment = data => {
    if (!data) {
        return '';
    }
    
    if (typeof data === 'string') {
        return data;
    }
    
    return bytesToSafeString(data);
};
