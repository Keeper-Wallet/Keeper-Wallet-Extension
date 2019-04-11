import { SIGN_TYPE } from '@waves/signature-adapter';
import { BigNumber } from '@waves/data-entities';

export const messageType = 'script_invocation';
export const txType = 'transaction';


export function getTransferAmount(amount, assetId) {
    if (typeof amount === 'object') {
        amount.assetId = assetId;
        return amount;
    }
    
    return { coins: amount, assetId };
}

export function getAssetsId(tx): Array<string> {
    const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
    const amountAssetId = [];
    
    (tx.payment || []).map(item => {
        switch (typeof item) {
            case 'string':
                return 'WAVES';
            case 'number':
                return  'WAVES';
            case 'object':
                return  item && item.assetId ? item.assetId : 'WAVES';
        }
    });
    
    return [ ...amountAssetId, feeAssetId ];
}

export function getFee(tx) {
    return typeof tx.fee === 'object' ? tx.fee : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAmount(tx) {
    let tokens = new BigNumber(0);
    let coins = new BigNumber(0);
    
    (tx.payment || []).forEach((item) => {
        if (item && item.tokens) {
            tokens = tokens.plus(item.tokens);
        } else if (item && item.coins) {
            coins = coins.plus(item.coins);
        } else if (item && item.amount) {
            coins = coins.plus(item.amount);
        } else {
            const parse = new BigNumber(item);
            if (!parse.isNaN()) {
                coins = coins.plus(parse);
            }
        }
    });
    
    const assetId = ((tx.payment || [])[0] || {}).assetId || 'WAVES';
    
    return { coins, tokens, assetId };
}

export function getAmountSign() {
    return '-';
}

export function isMe(tx: any, type: string) {
    return tx.type === SIGN_TYPE.SCRIPT_INVOCATION && type === txType;
}
