import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type MessageTx } from 'messages/types';
import { type PreferencesAccount } from 'preferences/types';

type TxVersions = {
  [T in MessageTx['type']]: Array<
    NonNullable<Extract<MessageTx, { type: T }>['version']>
  >;
} & Record<'1000' | '1001' | '1002' | '1003', number[]>;

const DEFAULT_TX_VERSIONS: TxVersions = {
  [TRANSACTION_TYPE.ISSUE]: [3, 2],
  [TRANSACTION_TYPE.TRANSFER]: [3, 2],
  [TRANSACTION_TYPE.REISSUE]: [3, 2],
  [TRANSACTION_TYPE.BURN]: [3, 2],
  [TRANSACTION_TYPE.LEASE]: [3, 2],
  [TRANSACTION_TYPE.CANCEL_LEASE]: [3, 2],
  [TRANSACTION_TYPE.ALIAS]: [3, 2],
  [TRANSACTION_TYPE.MASS_TRANSFER]: [2, 1],
  [TRANSACTION_TYPE.DATA]: [2, 1],
  [TRANSACTION_TYPE.SET_SCRIPT]: [2, 1],
  [TRANSACTION_TYPE.SPONSORSHIP]: [2, 1],
  [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: [2, 1],
  [TRANSACTION_TYPE.INVOKE_SCRIPT]: [2, 1],
  [TRANSACTION_TYPE.UPDATE_ASSET_INFO]: [1],
  '1000': [1],
  '1001': [1],
  '1002': [4, 3, 2, 1],
  '1003': [1, 0],
};

const LEDGER_TX_VERSIONS: TxVersions = {
  [TRANSACTION_TYPE.ISSUE]: [3, 2],
  [TRANSACTION_TYPE.TRANSFER]: [2],
  [TRANSACTION_TYPE.REISSUE]: [3, 2],
  [TRANSACTION_TYPE.BURN]: [3, 2],
  [TRANSACTION_TYPE.LEASE]: [3, 2],
  [TRANSACTION_TYPE.CANCEL_LEASE]: [3, 2],
  [TRANSACTION_TYPE.ALIAS]: [3, 2],
  [TRANSACTION_TYPE.MASS_TRANSFER]: [2, 1],
  [TRANSACTION_TYPE.DATA]: [2, 1],
  [TRANSACTION_TYPE.SET_SCRIPT]: [2, 1],
  [TRANSACTION_TYPE.SPONSORSHIP]: [2, 1],
  [TRANSACTION_TYPE.SET_ASSET_SCRIPT]: [2, 1],
  [TRANSACTION_TYPE.INVOKE_SCRIPT]: [2, 1],
  [TRANSACTION_TYPE.UPDATE_ASSET_INFO]: [1],
  '1000': [1],
  '1001': [1],
  '1002': [4, 3, 2, 1],
  '1003': [1, 0],
};

export function getTxVersions(accountType: PreferencesAccount['type']) {
  switch (accountType) {
    case 'ledger':
      return LEDGER_TX_VERSIONS;
    default:
      return DEFAULT_TX_VERSIONS;
  }
}
