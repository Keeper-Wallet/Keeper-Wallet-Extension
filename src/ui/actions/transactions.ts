import { Transaction } from 'ui/services/Background';
import { ACTION } from './constants';

export function signAndPublishTransaction(transaction: Transaction) {
  return {
    type: ACTION.SIGN_AND_PUBLISH_TRANSACTION,
    payload: transaction,
  };
}
