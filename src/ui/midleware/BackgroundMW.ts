import {
  ACTION,
  notificationChangeName,
  notificationDelete,
  notificationSelect,
  pairingLoading,
  pairingSetData,
  setActiveNotification,
  setTab,
  setUiState,
  updateActiveState,
  updateAliases,
  updateAsset,
  updateNfts,
  updateTxHistory,
} from '../actions';
import background from '../services/Background';
import { i18n } from '../i18n';
import { PAGES } from '../pageConfig';

export const pairingData = store => next => action => {
  if (action.type !== ACTION.PAIRING.GET_SEED) {
    return next(action);
  }
  const { currentNetwork } = store.getState();
  store.dispatch(pairingLoading(true));
  background.exportSeed(action.payload, currentNetwork).then(
    data => {
      store.dispatch(pairingSetData(data));
      store.dispatch(pairingLoading(false));
    },
    () => {
      store.dispatch(pairingSetData(null));
      store.dispatch(pairingLoading(false));
    }
  );
};

export const changeLang = store => next => action => {
  if (
    action.type === ACTION.CHANGE_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    background.setCurrentLocale(action.payload);
  }
  return next(action);
};

export const deleteNotifications = store => next => action => {
  if (action.type !== ACTION.NOTIFICATIONS.DELETE) {
    return next(action);
  }

  const ids = action.payload.length ? action.payload : action.payload.ids;
  const nextNotify = action.payload.length ? null : action.payload.next;

  return background.deleteNotifications(ids).then(() => {
    store.dispatch(setActiveNotification(nextNotify));
  });
};

export const setNotificationPerms = store => next => action => {
  if (action.type !== ACTION.NOTIFICATIONS.SET_PERMS) {
    return next(action);
  }

  background.setNotificationPermissions(action.payload);
};

export const setIdle = store => next => action => {
  if (action.type !== ACTION.REMOTE_CONFIG.SET_IDLE) {
    return next(action);
  }

  background.setIdleOptions({ type: action.payload });
};

export const updateLang = store => next => action => {
  if (
    action.type === ACTION.UPDATE_FROM_LNG &&
    action.payload !== store.getState().currentLocale
  ) {
    i18n.changeLanguage(action.payload);
  }
  return next(action);
};

export const updateBalances = store => next => action => {
  if (action.type === ACTION.GET_BALANCES) {
    background.updateBalances();
  }

  return next(action);
};

export const selectAccount = store => next => action => {
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

export const deleteActiveAccount = store => next => action => {
  if (action.type === ACTION.DELETE_ACTIVE_ACCOUNT) {
    const { selectedAccount, localState, currentNetwork } = store.getState();
    const selected = localState.assets.account
      ? localState.assets.account.address
      : selectedAccount.address;

    background.removeWallet(selected, currentNetwork).then(() => {
      store.dispatch(notificationDelete(true));
      setTimeout(() => {
        store.dispatch(notificationDelete(false));
        store.dispatch(setTab(PAGES.ROOT));
      }, 1000);
    });
    return null;
  }

  return next(action);
};

export const closeNotificationWindow = _ => next => action => {
  if (action.type === ACTION.CLOSE_WINDOW) {
    background.closeNotificationWindow();
  }
  return next(action);
};

export const deleteAccountMw = store => next => action => {
  if (action.type === ACTION.DELETE_ACCOUNT) {
    background.deleteVault().then(() => {
      store.dispatch(updateActiveState(null));
      store.dispatch(setTab(PAGES.ROOT));
      store.dispatch(
        setUiState({
          account: null,
        })
      );
    });
    return null;
  }

  return next(action);
};

export const uiState = store => next => action => {
  if (action.type === ACTION.SET_UI_STATE) {
    const ui = store.getState().uiState;
    const newState = { ...ui, ...action.payload };
    background.setUiState(newState).then(uiState => {
      store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: uiState });
    });
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

export const changeNetwork = store => next => action => {
  if (action.type === ACTION.CHANGE_NETWORK) {
    background
      .setNetwork(action.payload)
      .then(() => store.dispatch(setTab(PAGES.ROOT)));
    return null;
  }

  return next(action);
};

export const getAsset = store => next => action => {
  if (action.type === ACTION.GET_ASSETS) {
    background.assetInfo(action.payload, action.meta.force).then(
      data => {
        store.dispatch(updateAsset({ [action.payload]: data }));
      },
      () => {
        store.dispatch(updateAsset({ [action.payload]: {} }));
      }
    );
    return null;
  }

  return next(action);
};

export const getNfts = store => next => action => {
  if (action.type === ACTION.GET_NFTS) {
    background.nftInfo(action.payload).then(
      nfts => {
        store.dispatch(updateNfts(nfts));
      },
      () => {
        store.dispatch(updateNfts([]));
      }
    );
  }

  return next(action);
};

export const getTxHistory = store => next => action => {
  if (action.type === ACTION.GET_TX_HISTORY) {
    background
      .txHistory(action.payload)
      .then(messages => store.dispatch(updateTxHistory(messages)));
  }

  return next(action);
};

export const getAliases = store => next => action => {
  if (action.type === ACTION.GET_ALIASES) {
    background
      .aliasByAddress(action.payload)
      .then(aliases => store.dispatch(updateAliases(aliases)));
  }

  return next(action);
};

export const changeName = store => next => action => {
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

export const setCustomNode = store => next => action => {
  if (ACTION.CHANGE_NODE === action.type) {
    const { node, network } = action.payload;
    background.setCustomNode(node, network);
    return null;
  }

  return next(action);
};

export const setCustomCode = store => next => action => {
  if (ACTION.CHANGE_NETWORK_CODE === action.type) {
    const { code, network } = action.payload;
    background.setCustomCode(code, network);
    return null;
  }

  return next(action);
};

export const setCustomMatcher = store => next => action => {
  if (ACTION.CHANGE_MATCHER === action.type) {
    const { matcher, network } = action.payload;
    background.setCustomMatcher(matcher, network);
    return null;
  }

  return next(action);
};

export const lock = store => next => action => {
  if (action.type === ACTION.LOCK) {
    background.lock();
    return null;
  }
  return next(action);
};

export const broadcastTransaction = () => next => action => {
  if (action.type === ACTION.BROADCAST_TRANSACTION) {
    background.broadcastTransaction(action.payload);
  }

  return next(action);
};
