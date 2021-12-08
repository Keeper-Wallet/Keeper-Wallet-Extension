import { AssetDetail } from '../../../services/Background';
import { TRANSACTION_TYPE } from '@waves/ts-types';

const explorerUrls = new Map([
  ['W', 'wavesexplorer.com'],
  ['T', 'testnet.wavesexplorer.com'],
  ['S', 'stagenet.wavesexplorer.com'],
  ['custom', 'wavesexplorer.com/custom'],
]);

export function getTxLink(txId: string, networkCode: string): string {
  const explorer = explorerUrls.get(
    explorerUrls.has(networkCode) ? networkCode : 'custom'
  );
  return `https://${explorer}/tx/${txId}`;
}

export const colors = {
  basic200: '#DAE1E9',
  basic500: '#9BA6B2',
  submit400: '#1F5AF6',
  out: '#FFAF00',
  in: '#81C926',
};

const flat = (stateChanges: any): any[] =>
  (stateChanges?.transfers ?? [])
    .concat(stateChanges?.issues ?? [])
    .concat(stateChanges?.reissues ?? [])
    .concat(stateChanges?.burns ?? [])
    .concat(stateChanges?.sponsorFees ?? [])
    .concat(stateChanges?.leases ?? [])
    .concat(stateChanges?.leaseCancels ?? [])
    .concat(stateChanges?.invokes ?? [])
    .concat(
      (stateChanges?.invokes ?? []).reduce(
        (result, el) => result.concat(flat(el.stateChanges)),
        []
      )
    );

export const icontains = (source, target) =>
  source.toLowerCase().includes(target.toLowerCase());

type AssetFilterCtx = {
  term: string;
  onlyMy: boolean;
  address: string;
  assets: Record<string, AssetDetail>;
};

export const prepareAssetFilter =
  ({ term, onlyMy, address, assets }: AssetFilterCtx) =>
  ([assetId]) =>
    (!onlyMy || assets[assetId]?.issuer === address) &&
    (!term ||
      assetId === term ||
      icontains(assets[assetId]?.displayName ?? '', term));

type HistoryFilterCtx = {
  term: string;
  type: number;
  isIncoming: boolean;
  isOutgoing: boolean;
  addressOrAlias: string[];
  assets: Record<string, AssetDetail>;
};

export const applyHistoryFilters =
  ({
    term,
    type,
    isIncoming,
    isOutgoing,
    addressOrAlias,
    assets,
  }: HistoryFilterCtx) =>
  (
    tx: any // TODO better types
  ) => {
    const hasMassTransfers = (tx.transfers ?? []).reduce(
      (result: boolean, transfer: { amount: number; recipient: string }) =>
        result || addressOrAlias.includes(transfer.recipient),
      false
    );
    const hasInvokePayments = (tx.payment ?? []).length !== 0;
    const hasInvokePaymentsAsset = (tx.payment ?? []).reduce(
      (hasPayments, el) =>
        hasPayments ||
        el.assetId === term ||
        icontains(assets[el.assetId]?.displayName ?? '', term),
      false
    );

    return (
      (!term ||
        tx.id === term ||
        tx.assetId === term ||
        icontains(assets[tx.assetId]?.displayName ?? '', term) ||
        tx.sender === term ||
        tx.recipient === term ||
        icontains(tx.alias ?? '', term) ||
        tx.dApp === term ||
        hasInvokePaymentsAsset ||
        icontains(tx.call?.function ?? '', term) ||
        hasInvokeStateChanges(tx.stateChanges, term, assets)) &&
      (!type || tx.type === type) &&
      (!isIncoming ||
        (!addressOrAlias.includes(tx.sender) &&
          (addressOrAlias.includes(tx.recipient) || hasMassTransfers)) ||
        hasInvokeTransfers(tx.stateChanges, ...addressOrAlias)) &&
      (!isOutgoing ||
        (tx.type === TRANSACTION_TYPE.TRANSFER &&
          addressOrAlias.includes(tx.sender)) ||
        (tx.type === TRANSACTION_TYPE.MASS_TRANSFER && !hasMassTransfers) ||
        (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT && hasInvokePayments))
    );
  };

const hasInvokeStateChanges = (
  stateChanges: any,
  term: string,
  assets: Record<string, AssetDetail>
): boolean =>
  flat(stateChanges || {}).reduce(
    (hasItems, el) =>
      hasItems ||
      [el.asset, el.address, el.assetId, el.leaseId, el.dApp].includes(term) ||
      [
        el.address,
        el.name,
        assets[el.assetId]?.displayName,
        el.call?.function,
      ].reduce((result, name) => result || icontains(name, term), false),
    false
  );

const hasInvokeTransfers = (
  stateChanges: any,
  ...addressOrAlias: string[]
): boolean =>
  flat(stateChanges).reduce(
    (hasTransfers, el) => hasTransfers || addressOrAlias.includes(el.address),
    false
  );
