import { SIGN_TYPE } from '@waves/signature-adapter';

export const messageType = 'sponsorship';
export const txType = 'transaction';
export const SPONSOR_MODE = {
    enable: 'sponsor_enable',
    disable : 'sponsor_disable',
};

export function getAssetsId(tx): Array<string> {
    const feeAssetId = tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
    return [feeAssetId];
}

export function getFee(tx) {
    return typeof tx.fee === 'object' ? tx.fee : { coins: tx.fee, assetId: 'WAVES' };
}

export function getAssetFee(tx) {
    const amount = tx.minSponsoredAssetFee;
    return typeof amount === 'object' ? amount : { coins: amount, assetId: tx.assetId };
}

export function getAmount(tx = null) {
    return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
    return '';
}

export function isMe(tx: any, type: string) {
    return tx.type === SIGN_TYPE.SPONSORSHIP && type === txType;
}
