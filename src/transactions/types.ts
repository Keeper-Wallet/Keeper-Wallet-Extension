import {
  AliasTransaction,
  AssetDecimals,
  BurnTransaction,
  CancelLeaseTransaction,
  DataTransaction,
  DataTransactionEntry,
  EthereumTransaction,
  ExchangeTransaction,
  GenesisTransaction,
  InvokeExpressionTransaction,
  InvokeScriptTransaction,
  IssueTransaction,
  LeaseTransaction,
  Long,
  MassTransferTransaction,
  PaymentTransaction,
  ReissueTransaction,
  SetAssetScriptTransaction,
  SetScriptTransaction,
  SponsorshipTransaction,
  TransferTransaction,
  TStateChanges,
  UpdateAssetInfoTransaction,
  WithApiMixin,
  WithId,
} from '@waves/ts-types';

export interface IWithStateChanges {
  stateChanges: TStateChanges;
}

export type TStateUpdate = {
  data: (DataTransactionEntry & { address: string })[];
  transfers: {
    address: string;
    sender: string;
    amount: Long;
    asset: string | null;
  }[];
  issues: {
    address: string;
    assetId: string;
    name: string;
    description: string;
    quantity: number;
    decimals: AssetDecimals;
    isReissuable: boolean;
    compiledScript: null | string;
    nonce: number;
  }[];
  reissues: {
    address: string;
    assetId: string;
    isReissuable: boolean;
    quantity: number;
  }[];
  burns: {
    address: string;
    assetId: string;
    quantity: number;
  }[];
  sponsorFees: {
    address: string;
    assetId: string;
    minSponsoredAssetFee: number;
  }[];
  leases: {
    sender: string;
    leaseId: string;
    recipient: string;
    amount: Long;
  }[];
  leaseCancels: { leaseId: string; address: string }[];
};

export type TWithStateUpdate = { stateUpdate: TStateUpdate };
export type TWithState = IWithStateChanges & TWithStateUpdate;
export type TWithOriginId = { originTransactionId: string };
export type TWithApplicationStatus = {
  applicationStatus?: 'succeeded' | 'script_execution_failed';
};

export type TransactionFromApi<LONG = Long> = (
  | GenesisTransaction<LONG>
  | PaymentTransaction<LONG>
  | (IssueTransaction<LONG> & { assetId: string })
  | TransferTransaction<LONG>
  | ReissueTransaction<LONG>
  | BurnTransaction<LONG>
  | (LeaseTransaction<LONG> & { status: 'active' | 'canceled' })
  | (CancelLeaseTransaction<LONG> & {
      lease: LeaseTransaction & WithApiMixin & WithId & TWithOriginId;
    })
  | AliasTransaction<LONG>
  | (MassTransferTransaction<LONG> & { transferCount: LONG; totalAmount: LONG })
  | DataTransaction<LONG>
  | SetScriptTransaction<LONG>
  | SponsorshipTransaction<LONG>
  | ExchangeTransaction<LONG>
  | SetAssetScriptTransaction<LONG>
  | (InvokeScriptTransaction<LONG> & TWithState)
  | UpdateAssetInfoTransaction<LONG>
  | (InvokeExpressionTransaction<LONG> & TWithState)
  | EthereumTransaction<LONG>
) &
  TWithApplicationStatus &
  WithApiMixin &
  WithId;
