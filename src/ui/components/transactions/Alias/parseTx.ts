import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'create-alias';

export function getAssetsId(tx): Array<string> {
    const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : 'WAVES';
    return [feeAssetId];
}

export function getFee(tx) {
    return typeof tx.fee === 'object' ? tx.fee : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function isMe(tx: any, type: string) {
    return tx.type = SIGN_TYPE.CREATE_ALIAS && type === 'transaction'
}
