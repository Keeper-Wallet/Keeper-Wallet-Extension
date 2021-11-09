import { ACTION } from './constants';
import { IMoneyLike } from '../utils/converters';

export const approve = messageId => ({
  type: ACTION.APPROVE,
  payload: messageId,
});

export const clearMessages = () => ({
  type: ACTION.CLEAR_MESSAGES,
  payload: null,
});

export const reject = messageId => ({
  type: ACTION.REJECT,
  payload: messageId,
});

export const rejectForever = messageId => ({
  type: ACTION.REJECT_FOREVER,
  payload: { messageId, forever: true },
});

export const updateTransactionFee = (messageId: string, fee: IMoneyLike) => ({
  type: ACTION.UPDATE_TRANSACTION_FEE,
  payload: fee,
  meta: { messageId },
});
