import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'lease';

export function getAssetsId(tx): Array<string> {
    const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
    const amountAssetId = tx.amount && tx.amount.assetId ? tx.amount.assetId : tx.assetId || 'WAVES';
    
    if (feeAssetId === amountAssetId) {
        return [amountAssetId]
    }
    
    return [amountAssetId, feeAssetId];
}

export function getFee(tx) {
    return typeof tx.fee === 'object' ? tx.fee : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
    return typeof tx.amount === 'object' ? tx.amount : { coins: tx.amount, assetId: 'WAVES' };
}

export function isMe(tx: any, type: string) {
    return tx.type === SIGN_TYPE.LEASE && type === 'transaction'
}
