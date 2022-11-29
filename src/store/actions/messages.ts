import { IMoneyLike } from '../../ui/utils/converters';
import { ACTION } from './constants';

export const approve = (messageId: string) => ({
  type: ACTION.APPROVE,
  payload: messageId,
});

export const clearMessages = () => ({
  type: ACTION.CLEAR_MESSAGES,
  payload: null,
});

export const reject = (messageId: string) => ({
  type: ACTION.REJECT,
  payload: messageId,
});

export const rejectForever = (messageId: string) => ({
  type: ACTION.REJECT_FOREVER,
  payload: { messageId, forever: true },
});

export const updateTransactionFee = (messageId: string, fee: IMoneyLike) => ({
  type: ACTION.UPDATE_TRANSACTION_FEE,
  payload: { messageId, fee },
});
