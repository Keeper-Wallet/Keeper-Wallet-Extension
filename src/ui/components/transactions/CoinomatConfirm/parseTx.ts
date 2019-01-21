import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'coinomat_confirm';

export function getAssetsId(tx = null): Array<string> {
    return [];
}

export function getFee(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function isMe(tx: any, type: string) {
    return tx.type ===  SIGN_TYPE.COINOMAT_CONFIRMATION && type === 'request';
}
