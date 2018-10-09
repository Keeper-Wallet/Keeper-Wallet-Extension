import * as SG from '@waves/signature-generator';
import * as SA from '@waves/signature-adapter'


function blake2b(input) {
    return SG.libs.blake2b.blake2b(input, null, 32);
}

function keccak(input) {
    return SG.libs.keccak256.array(input);
}

function hashChain(input) {
    return keccak(blake2b(input));
}

export function publicKeyHashFromAddress(address) {
    const rawPKHash = SG.libs.base58.decode(address).slice(2, 22);
    return SG.libs.base58.encode(rawPKHash)
}

export function publicKeyHashFromPK(pk) {
    const decodedPK = SG.libs.base58.decode(pk);
    const rawPKHash = hashChain(decodedPK).slice(0, 20);
    return SG.libs.base58.encode(rawPKHash)
}

export function addressFromPublicKey(pk, network) {
    const publicKeyBytes = SG.libs.base58.decode(pk);
    const prefix = Uint8Array.from([SG.ADDRESS_VERSION, network === 'mainnet' ? SG.MAINNET_BYTE : SG.TESTNET_BYTE]);
    const publicKeyHashPart = Uint8Array.from(hashChain(publicKeyBytes).slice(0, 20));
    const rawAddress = SG.utils.concatUint8Arrays(prefix, publicKeyHashPart);
    const addressHash = Uint8Array.from(hashChain(rawAddress).slice(0, 4));
    return SG.libs.base58.encode(SG.utils.concatUint8Arrays(rawAddress, addressHash));
}

export function networkByteFromAddress(address) {
    const rawNetworkByte = SG.libs.base58.decode(address).slice(1, 2);
    return String.fromCharCode(rawNetworkByte)
}