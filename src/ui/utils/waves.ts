import { SeedAdapter, TSignData } from '@waves/signature-adapter';
import * as SG from '@waves/signature-generator';
import { utils } from '@waves/signature-generator';


export function networkByteFromAddress(address: string): string {
    const rawNetworkByte = SG.libs.base58.decode(address)[1];
    return String.fromCharCode(rawNetworkByte);
}

export function addressFromPublicKey(pk: string, network: 'mainnet'|'testnet'): string {
    const publicKeyBytes = SG.libs.base58.decode(pk);
    const prefix = Uint8Array.from([SG.ADDRESS_VERSION, network === 'mainnet' ? SG.MAINNET_BYTE : SG.TESTNET_BYTE]);
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



function blake2b(input): Uint8Array {
    return SG.libs.blake2b.blake2b(input, null, 32);
}

function keccak(input): Uint8Array {
    return SG.libs.keccak256.array(input);
}

function hashChain(input): Uint8Array {
    return keccak(blake2b(input));
}
