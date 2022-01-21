import * as Sentry from '@sentry/react';
import {
  ACTION,
  approveError,
  approveOk,
  approvePending,
  rejectOk,
  setActiveMessage,
} from '../actions';
import { MSG_STATUSES } from '../../constants';
import background from '../services/Background';

export const updateActiveMessageReducer = store => next => action => {
  const { activePopup, messages } = store.getState();
  const activeMessage = activePopup && activePopup.msg;

  if (action.type === ACTION.UPDATE_MESSAGES) {
    const { unapprovedMessages, messages } = action.payload;

    if (!activeMessage && unapprovedMessages.length) {
      return next(action);
    }

    const activeMessageUpdated = messages.find(
      ({ id }) => id === activeMessage.id
    );

    if (activeMessageUpdated) {
      const { status } = activeMessageUpdated;

      switch (status) {
        case MSG_STATUSES.REJECTED:
        case MSG_STATUSES.REJECTED_FOREVER:
          store.dispatch(rejectOk(activeMessageUpdated.id));
          store.dispatch(approvePending(false));
          background.deleteMessage(activeMessageUpdated.id);
          break;
        case MSG_STATUSES.SIGNED:
        case MSG_STATUSES.PUBLISHED:
          store.dispatch(approveOk(activeMessageUpdated.id));
          store.dispatch(approvePending(false));
          background.deleteMessage(activeMessageUpdated.id);
          break;
        case MSG_STATUSES.FAILED:
          store.dispatch(approvePending(false));
          store.dispatch(
            approveError({
              error: activeMessageUpdated.err.message,
              message: activeMessageUpdated,
            })
          );
          background.deleteMessage(activeMessageUpdated.id);
          break;
      }
    }

    return next(action);
  }

  if (action.type === ACTION.APPROVE_REJECT_CLEAR) {
    const message = messages.find(({ id }) => id !== activeMessage.id);
    store.dispatch(setActiveMessage(action.payload ? null : message));
  }

  if (action.type === ACTION.UPDATE_TRANSACTION_FEE) {
    const { messageId, fee } = action.payload;
    background
      .updateTransactionFee(messageId, fee)
      .then(message => store.dispatch(setActiveMessage(message)));
  }

  return next(action);
};

export const clearMessages = () => next => action => {
  if (ACTION.CLEAR_MESSAGES === action.type) {
    background.clearMessages();
    return;
  }

  return next(action);
};

export const approve = store => next => action => {
  if (action.type !== ACTION.APPROVE) {
    return next(action);
  }
  const messageId = action.payload;
  const { selectedAccount, currentNetwork } = store.getState();

  background.getMessageById(messageId).then(message => {
    background
      .approve(messageId, selectedAccount, currentNetwork)
      .catch(async err => {
        const errorMessage = err && err.message ? err.message : String(err);

        // messages from keeper itself have an empty origin
        if (message.origin) {
          const shouldIgnore = await background.shouldIgnoreError(
            'contentScriptApprove',
            errorMessage
          );

          if (shouldIgnore) {
            return;
          }
        }

        Sentry.withScope(scope => {
          const fingerprint = ['{{ default }}', message.type];

          if (message.type === 'transaction') {
            fingerprint.push(message.data.type);
          }

          scope.setFingerprint(fingerprint);
          Sentry.captureException(err);
        });
      });
  });

  store.dispatch(approvePending(true));
};

export const reject = store => next => action => {
  if (action.type !== ACTION.REJECT) {
    return next(action);
  }

  background.reject(action.payload);
  store.dispatch(approvePending(true));
};

export const rejectForever = store => next => action => {
  if (action.type != ACTION.REJECT_FOREVER) {
    return next(action);
  }
  const { messageId, forever } = action.payload;

  background.reject(messageId, forever);
  store.dispatch(approvePending(true));
};
