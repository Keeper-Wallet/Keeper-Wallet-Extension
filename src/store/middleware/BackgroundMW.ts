import i18next from 'i18next';

import { NotificationsStoreItem } from '../../notifications/types';
import { AppMiddleware } from '../../store/types';
import background from '../../ui/services/Background';
import { ACTION } from '../actions/constants';
import {
  notificationChangeName,
  notificationSelect,
} from '../actions/localState';
import { setActiveNotification } from '../actions/notifications';

export const changeLang: AppMiddleware = store => next => action => {
  if (
    action.type === ACTION.CHANGE_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    background.setCurrentLocale(action.payload);
  }
  return next(action);
};

export const deleteNotifications: AppMiddleware = store => next => action => {
  if (action.type !== ACTION.NOTIFICATIONS.DELETE) {
    return next(action);
  }

  const ids = (action.payload as string[]).length
    ? (action.payload as string[])
    : (action.payload as { ids: string[] }).ids;

  const nextNotify = (action.payload as string[]).length
    ? null
    : (action.payload as { next: NotificationsStoreItem[] | null }).next;

  return background.deleteNotifications(ids).then(() => {
    store.dispatch(setActiveNotification(nextNotify));
  });
};

export const setNotificationPerms: AppMiddleware = () => next => action => {
  if (action.type !== ACTION.NOTIFICATIONS.SET_PERMS) {
    return next(action);
  }

  background.setNotificationPermissions(action.payload);
};

export const setIdle: AppMiddleware = () => next => action => {
  if (action.type !== ACTION.REMOTE_CONFIG.SET_IDLE) {
    return next(action);
  }

  background.setIdleOptions({ type: action.payload });
};

export const updateLang: AppMiddleware = store => next => action => {
  if (
    action.type === ACTION.UPDATE_FROM_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    i18next.changeLanguage(action.payload);
  }
  return next(action);
};

export const updateBalances: AppMiddleware = () => next => action => {
  if (action.type === ACTION.GET_BALANCES) {
    background.updateBalances();
  }

  return next(action);
};

export const selectAccount: AppMiddleware = store => next => action => {
  if (
    action.type === ACTION.SELECT_ACCOUNT &&
    store.getState().selectedAccount?.address !== action.payload.address
  ) {
    const { currentNetwork } = store.getState();
    background
      .selectAccount(action.payload.address, currentNetwork)
      .then(() => {
        store.dispatch(notificationSelect(true));
        setTimeout(() => store.dispatch(notificationSelect(false)), 1000);
      });
  }

  return next(action);
};

export const uiState: AppMiddleware = store => next => action => {
  if (action.type === ACTION.SET_UI_STATE) {
    const ui = store.getState().uiState;
    const newState = { ...ui, ...action.payload };
    store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: newState });
    background.setUiState(newState);
    return null;
  }

  return next(action);
};

export const getAsset: AppMiddleware = () => next => action => {
  if (action.type === ACTION.GET_ASSETS) {
    background.assetInfo(action.payload);
  }

  return next(action);
};

export const updateAssets: AppMiddleware = () => next => action => {
  if (action.type === ACTION.UPDATE_ASSETS) {
    background.updateAssets(action.payload);
  }

  return next(action);
};

export const setAddress: AppMiddleware = () => next => action => {
  if (action.type === ACTION.SET_ADDRESS) {
    const { address, name } = action.payload;
    background.setAddress(address, name);
  }

  return next(action);
};

export const setAddresses: AppMiddleware = () => next => action => {
  if (action.type === ACTION.SET_ADDRESSES) {
    background.setAddresses(action.payload);
  }

  return next(action);
};

export const removeAddress: AppMiddleware = () => next => action => {
  if (action.type === ACTION.REMOVE_ADDRESS) {
    const { address } = action.payload;
    background.removeAddress(address);
  }

  return next(action);
};

export const favoriteAsset: AppMiddleware = () => next => action => {
  if (action.type === ACTION.FAVORITE_ASSET) {
    background.toggleAssetFavorite(action.payload);
  }
  return next(action);
};

export const changeName: AppMiddleware = store => next => action => {
  if (action.type === ACTION.CHANGE_ACCOUNT_NAME) {
    const { address, name } = action.payload;
    const { currentNetwork } = store.getState();

    background.editWalletName(address, name, currentNetwork).then(() => {
      store.dispatch(notificationChangeName(true));
      setTimeout(() => store.dispatch(notificationChangeName(false)), 1000);
    });
    return null;
  }

  return next(action);
};

export const setCustomNode: AppMiddleware = () => next => action => {
  if (ACTION.CHANGE_NODE === action.type) {
    const { node, network } = action.payload;
    background.setCustomNode(node, network);
    return null;
  }

  return next(action);
};

export const setCustomCode: AppMiddleware = () => next => action => {
  if (ACTION.CHANGE_NETWORK_CODE === action.type) {
    const { code, network } = action.payload;
    background.setCustomCode(code, network);
    return null;
  }

  return next(action);
};

export const setCustomMatcher: AppMiddleware = () => next => action => {
  if (ACTION.CHANGE_MATCHER === action.type) {
    const { matcher, network } = action.payload;
    background.setCustomMatcher(matcher, network);
    return null;
  }

  return next(action);
};

export const lock: AppMiddleware = () => next => action => {
  if (action.type === ACTION.LOCK) {
    background.lock();
    return null;
  }
  return next(action);
};
