import { MessageStatus } from 'messages/types';

import Background from '../../ui/services/Background';
import { ACTION } from '../actions/constants';
import { AppMiddleware } from '../types';

export const updateActiveMessageReducer: AppMiddleware =
  store => next => action => {
    if (action.type === ACTION.UPDATE_MESSAGES) {
      const { activePopup } = store.getState();

      if (!activePopup?.msg && action.payload.unapprovedMessages.length) {
        return next(action);
      }

      const activeMessage = action.payload.messages.find(
        message => message.id === activePopup?.msg?.id
      );

      if (activeMessage) {
        if (activeMessage.status !== MessageStatus.UnApproved) {
          Background.deleteMessage(activeMessage.id);
        }
      }
    }

    return next(action);
  };
