import { ISignTxData } from '@waves/ledger/lib/Waves';

export type LedgerSignRequest = { id: string } & {
  type: 'transaction';
  data: ISignTxData;
};
