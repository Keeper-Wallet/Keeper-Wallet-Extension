import { libs } from '@waves/waves-transactions';


function blake2b(input) {
    return libs.crypto.blake2b(input);
}

function keccak(input) {
    return libs.crypto.keccak(input);
}

function hashChain(input) {
    return keccak(blake2b(input));
}

export function publicKeyHashFromAddress(address) {
    const rawPKHash = libs.crypto.base58decode(address).slice(2, 22);
    return libs.crypto.base58encode(rawPKHash)
}

export function publicKeyHashFromPK(pk) {
    const decodedPK = libs.crypto.base58decode(pk);
    const rawPKHash = hashChain(decodedPK).slice(0, 20);
    return libs.crypto.base58encode(rawPKHash)
}

export function addressFromPublicKey(pk, network) {
    return new Seed(pk, network).address;
}

export function networkByteFromAddress(address) {
    const rawNetworkByte = libs.crypto.base58decode(address).slice(1, 2);
    return String.fromCharCode(rawNetworkByte)
}
