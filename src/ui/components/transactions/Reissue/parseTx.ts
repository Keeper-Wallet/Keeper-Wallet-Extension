import { SIGN_TYPE } from '@waves/signature-adapter';
import { Asset, Money } from '@waves/data-entities';

export const messageType = 'reissue';

export function getAssetsId(tx): Array<string> {
    const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
    const amountAssetId = tx.quantity && tx.quantity.assetId ? tx.quantity.assetId : tx.assetId;
    
    if (feeAssetId === amountAssetId) {
        return [amountAssetId]
    }
    
    return [amountAssetId, feeAssetId];
}

export function getFee(tx) {
    return typeof tx.fee === 'object' ? tx.fee : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAmount(tx = null) {
    return typeof tx.quantity === 'object' ? tx.quantity : { coins: tx.quantity, assetId: tx.assetId };
}

export function isMe(tx: any, type: string) {
    return tx.type === SIGN_TYPE.REISSUE && type === 'transaction';
}
