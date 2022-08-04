import {
  ACTION,
  notificationChangeName,
  notificationDelete,
  notificationSelect,
  setActiveNotification,
  setTab,
  updateActiveState,
} from '../actions';
import background from '../services/Background';
import i18n from '../i18n';
import { UiMiddleware } from 'ui/store';
import { NotificationsStoreItem } from 'notifications/types';

export const changeLang: UiMiddleware = store => next => action => {
  if (
    action.type === ACTION.CHANGE_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    background.setCurrentLocale(action.payload);
  }
  return next(action);
};

export const deleteNotifications: UiMiddleware = store => next => action => {
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

export const setNotificationPerms: UiMiddleware = () => next => action => {
  if (action.type !== ACTION.NOTIFICATIONS.SET_PERMS) {
    return next(action);
  }

  background.setNotificationPermissions(action.payload);
};

export const setIdle: UiMiddleware = () => next => action => {
  if (action.type !== ACTION.REMOTE_CONFIG.SET_IDLE) {
    return next(action);
  }

  background.setIdleOptions({ type: action.payload });
};

export const updateLang: UiMiddleware = store => next => action => {
  if (
    action.type === ACTION.UPDATE_FROM_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    i18n.changeLanguage(action.payload);
  }
  return next(action);
};

export const updateBalances: UiMiddleware = () => next => action => {
  if (action.type === ACTION.GET_BALANCES) {
    background.updateBalances();
  }

  return next(action);
};

export const selectAccount: UiMiddleware = store => next => action => {
  if (
    action.type === ACTION.SELECT_ACCOUNT &&
    store.getState().selectedAccount.address !== action.payload.address
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

export const deleteActiveAccount: UiMiddleware = store => next => action => {
  if (action.type === ACTION.DELETE_ACTIVE_ACCOUNT) {
    const { selectedAccount, localState, currentNetwork } = store.getState();
    const selected = localState.assets.account
      ? localState.assets.account.address
      : selectedAccount.address;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    background.removeWallet(selected!, currentNetwork).then(() => {
      store.dispatch(notificationDelete(true));
      setTimeout(() => {
        store.dispatch(notificationDelete(false));
        store.dispatch(setTab(null));
      }, 1000);
    });
    return null;
  }

  return next(action);
};

export const closeNotificationWindow: UiMiddleware = () => next => action => {
  if (action.type === ACTION.CLOSE_WINDOW) {
    background.closeNotificationWindow();
  }
  return next(action);
};

export const deleteAccountMw: UiMiddleware = store => next => action => {
  if (action.type === ACTION.DELETE_ACCOUNT) {
    background.deleteVault().then(() => {
      store.dispatch(updateActiveState());
      store.dispatch(setTab(null));
    });
    return null;
  }

  return next(action);
};

export const uiState: UiMiddleware = store => next => action => {
  if (action.type === ACTION.SET_UI_STATE) {
    const ui = store.getState().uiState;
    const newState = { ...ui, ...action.payload };
    store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: newState });
    background.setUiState(newState);
    return null;
  }

  if (action.type === ACTION.SET_UI_STATE_AND_TAB) {
    const ui = store.getState().uiState;
    const newState = { ...ui, ...action.payload.ui };
    background.setUiState(newState).then(uiState => {
      store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: uiState });
      store.dispatch(setTab(action.payload.tab));
    });

    return;
  }

  return next(action);
};

export const changeNetwork: UiMiddleware = store => next => action => {
  if (action.type === ACTION.CHANGE_NETWORK) {
    background
      .setNetwork(action.payload)
      .then(() => store.dispatch(setTab(null)));
    return null;
  }
  if (action.type === ACTION.UPDATE_CURRENT_NETWORK) {
    if (store.getState().localState.tabMode === 'tab') {
      store.dispatch(setTab(null));
    }
  }

  return next(action);
};

export const getAsset: UiMiddleware = () => next => action => {
  if (action.type === ACTION.GET_ASSETS) {
    background.assetInfo(action.payload);
  }

  return next(action);
};

export const updateAssets: UiMiddleware = () => next => action => {
  if (action.type === ACTION.UPDATE_ASSETS) {
    background.updateAssets(action.payload);
  }

  return next(action);
};

export const setAddress: UiMiddleware = () => next => action => {
  if (action.type === ACTION.SET_ADDRESS) {
    const { address, name } = action.payload;
    background.setAddress(address, name);
  }

  return next(action);
};

export const setAddresses: UiMiddleware = () => next => action => {
  if (action.type === ACTION.SET_ADDRESSES) {
    background.setAddresses(action.payload);
  }

  return next(action);
};

export const removeAddress: UiMiddleware = () => next => action => {
  if (action.type === ACTION.REMOVE_ADDRESS) {
    const { address } = action.payload;
    background.removeAddress(address);
  }

  return next(action);
};

export const favoriteAsset: UiMiddleware = () => next => action => {
  if (action.type === ACTION.FAVORITE_ASSET) {
    background.toggleAssetFavorite(action.payload);
  }
  return next(action);
};

export const changeName: UiMiddleware = store => next => action => {
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

export const setCustomNode: UiMiddleware = () => next => action => {
  if (ACTION.CHANGE_NODE === action.type) {
    const { node, network } = action.payload;
    background.setCustomNode(node, network);
    return null;
  }

  return next(action);
};

export const setCustomCode: UiMiddleware = () => next => action => {
  if (ACTION.CHANGE_NETWORK_CODE === action.type) {
    const { code, network } = action.payload;
    background.setCustomCode(code, network);
    return null;
  }

  return next(action);
};

export const setCustomMatcher: UiMiddleware = () => next => action => {
  if (ACTION.CHANGE_MATCHER === action.type) {
    const { matcher, network } = action.payload;
    background.setCustomMatcher(matcher, network);
    return null;
  }

  return next(action);
};

export const lock: UiMiddleware = () => next => action => {
  if (action.type === ACTION.LOCK) {
    background.lock();
    return null;
  }
  return next(action);
};

export const signAndPublishTransaction: UiMiddleware = () => next => action => {
  if (action.type === ACTION.SIGN_AND_PUBLISH_TRANSACTION) {
    background.signAndPublishTransaction(action.payload).catch(err => {
      if (
        err instanceof Error &&
        /user denied request|failed request/i.test(err.message)
      ) {
        return;
      }

      throw err;
    });
  }

  return next(action);
};
