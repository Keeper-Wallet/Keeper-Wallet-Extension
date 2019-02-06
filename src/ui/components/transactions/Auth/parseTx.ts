import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'auth';
export const txType = 'auth';

export function getAssetsId(tx = null): Array<string> {
    return ['WAVES'];
}

export function getFee(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
    return '';
}

export function isMe(tx: any, type: string) {
    return tx.type ===  SIGN_TYPE.AUTH && type === txType;
}
