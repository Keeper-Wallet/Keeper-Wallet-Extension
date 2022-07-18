import { TRANSACTION_TYPE } from '@waves/ts-types';

export const SPONSORED_FEE_TX_TYPES: number[] = [
  TRANSACTION_TYPE.TRANSFER,
  TRANSACTION_TYPE.INVOKE_SCRIPT,
];
