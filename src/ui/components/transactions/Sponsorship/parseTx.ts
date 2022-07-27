import { TRANSACTION_TYPE } from '@waves/ts-types';
import { IMoneyLike } from 'ui/utils/converters';

export const messageType = 'sponsorship';
export const txType = 'transaction';
export const SPONSOR_MODE = {
  enable: 'sponsor_enable',
  disable: 'sponsor_disable',
};

export function getAssetsId(tx: {
  fee?: { assetId?: string };
  feeAssetId?: string;
  minSponsoredAssetFee?: { assetId?: string };
}): string[] {
  const feeAssetId =
    tx.fee && tx.fee.assetId ? tx.fee.assetId : tx.feeAssetId || 'WAVES';
  const sponsoredAssetId =
    (tx.minSponsoredAssetFee && tx.minSponsoredAssetFee.assetId) || 'WAVES';
  return [feeAssetId, sponsoredAssetId];
}

export { getFee } from '../BaseTransaction/parseTx';

export function getAssetFee(tx: {
  assetId: string;
  minSponsoredAssetFee: IMoneyLike | string;
}) {
  const amount = tx.minSponsoredAssetFee;
  return typeof amount === 'object'
    ? amount
    : { coins: amount, assetId: tx.assetId };
}

export function getAmount() {
  return { coins: 0, assetId: 'WAVES' };
}

export function getAmountSign() {
  return '' as const;
}

export function isMe(tx: { type?: unknown }, type: string | null) {
  return tx.type === TRANSACTION_TYPE.SPONSORSHIP && type === txType;
}
