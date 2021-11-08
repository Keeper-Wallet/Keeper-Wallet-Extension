import { ACTION } from './constants';

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
