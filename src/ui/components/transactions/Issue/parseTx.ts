import { SIGN_TYPE } from '@waves/signature-adapter';
import { Asset, Money } from '@waves/data-entities';

export const messageType = 'issue';

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
    return new Money(tx.quantity, new Asset(tx));
}

export function isMe(tx: any, type: string) {
    return tx.type === SIGN_TYPE.ISSUE && type === 'transaction'
}
