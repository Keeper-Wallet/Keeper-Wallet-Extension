import {utils} from '@waves/signature-generator'

export function encrypt(object, password) {
    const jsonObj = JSON.stringify(object);
    return utils.crypto.encryptSeed(jsonObj, password)
}

export function decrypt(ciphertext, password) {
    try {
        const decryptedJson = utils.crypto.decryptSeed(ciphertext, password);
        return JSON.parse(decryptedJson)
    } catch (e) {
        throw new Error('Invalid password')
    }
}
