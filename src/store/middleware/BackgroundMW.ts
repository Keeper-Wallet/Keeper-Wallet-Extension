import i18next from 'i18next';

import { type AppMiddleware } from '../../store/types';
import Background from '../../ui/services/Background';
import { ACTION } from '../actions/constants';
import { notificationSelect } from '../actions/localState';

export const changeLang: AppMiddleware = store => next => action => {
  if (
    action.type === ACTION.CHANGE_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    Background.setCurrentLocale(action.payload);
  }
  return next(action);
};

export const setNotificationPerms: AppMiddleware = () => next => action => {
  if (action.type !== ACTION.NOTIFICATIONS.SET_PERMS) {
    return next(action);
  }

  Background.setNotificationPermissions(action.payload);
};

export const setIdle: AppMiddleware = () => next => action => {
  if (action.type !== ACTION.REMOTE_CONFIG.SET_IDLE) {
    return next(action);
  }

  Background.setIdleOptions({ type: action.payload });
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

export const updateCurrentAccountBalance: AppMiddleware =
  () => next => action => {
    if (action.type === ACTION.GET_BALANCES) {
      Background.updateCurrentAccountBalance();
    }

    return next(action);
  };

export const selectAccount: AppMiddleware = store => next => action => {
  if (
    action.type === ACTION.SELECT_ACCOUNT &&
    store.getState().selectedAccount?.address !== action.payload.address
  ) {
    const { currentNetwork } = store.getState();
    Background.selectAccount(action.payload.address, currentNetwork).then(
      () => {
        store.dispatch(notificationSelect(true));
        setTimeout(() => store.dispatch(notificationSelect(false)), 1000);
      },
    );
  }

  return next(action);
};

export const uiState: AppMiddleware = store => next => action => {
  if (action.type === ACTION.SET_UI_STATE) {
    const ui = store.getState().uiState;
    const newState = { ...ui, ...action.payload };
    store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: newState });
    Background.setUiState(newState);
    return null;
  }

  return next(action);
};

export const getAsset: AppMiddleware = () => next => action => {
  if (action.type === ACTION.GET_ASSETS) {
    Background.assetInfo(action.payload);
  }

  return next(action);
};

export const setAddress: AppMiddleware = () => next => action => {
  if (action.type === ACTION.SET_ADDRESS) {
    const { address, name } = action.payload;
    Background.setAddress(address, name);
  }

  return next(action);
};

export const setAddresses: AppMiddleware = () => next => action => {
  if (action.type === ACTION.SET_ADDRESSES) {
    Background.setAddresses(action.payload);
  }

  return next(action);
};

export const removeAddress: AppMiddleware = () => next => action => {
  if (action.type === ACTION.REMOVE_ADDRESS) {
    const { address } = action.payload;
    Background.removeAddress(address);
  }

  return next(action);
};

export const setCustomNode: AppMiddleware = () => next => action => {
  if (ACTION.CHANGE_NODE === action.type) {
    const { node, network } = action.payload;
    Background.setCustomNode(node, network);
    return null;
  }

  return next(action);
};

export const setCustomCode: AppMiddleware = () => next => action => {
  if (ACTION.CHANGE_NETWORK_CODE === action.type) {
    const { code, network } = action.payload;
    Background.setCustomCode(code, network);
    return null;
  }

  return next(action);
};

export const setCustomMatcher: AppMiddleware = () => next => action => {
  if (ACTION.CHANGE_MATCHER === action.type) {
    const { matcher, network } = action.payload;
    Background.setCustomMatcher(matcher, network);
    return null;
  }

  return next(action);
};
