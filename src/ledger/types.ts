import { ISignData, ISignTxData } from '@waves/ledger/lib/Waves';

export type LedgerSignRequest = { id: string } & (
  | { type: 'transaction'; data: ISignTxData }
  | { type: 'request'; data: ISignData }
  | { type: 'someData'; data: ISignData }
);
