import { Transaction } from 'ui/services/Background';
import { ACTION } from './constants';

export function broadcastTransaction(transaction: Transaction) {
  return {
    type: ACTION.BROADCAST_TRANSACTION,
    payload: transaction,
  };
}
