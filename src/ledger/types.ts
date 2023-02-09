import {
  type ISignData,
  type ISignOrderData,
  type ISignTxData,
} from '@waves/ledger/lib/Waves';

export type LedgerSignRequest = { id: string } & (
  | { type: 'order'; data: ISignOrderData }
  | { type: 'request'; data: ISignData }
  | { type: 'someData'; data: ISignData }
  | { type: 'transaction'; data: ISignTxData }
);
