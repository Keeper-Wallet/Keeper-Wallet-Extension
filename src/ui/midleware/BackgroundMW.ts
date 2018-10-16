import { ACTION } from '../actions/constants';
import { config } from '@waves/signature-generator';
import background from '../services/Background';
import { i18n } from '../i18n';
import {
    setTab,
    updateAsset,
    notificationDelete,
    notificationSelect,
    notificationChangeName,
    approveError,
    approveOk,
    approvePending, rejectOk,
} from '../actions';
import { PAGES } from '../pageConfig';
import { store } from '../store';

export const changeLang = store => next => action => {
    if (action.type === ACTION.CHANGE_LNG && action.payload !== store.getState().currentLocale) {
        background.setCurrentLocale(action.payload);
    }
    return next(action);
};

export const updateLang = store => next => action => {
    if (action.type === ACTION.UPDATE_FROM_LNG && action.payload !== store.getState().currentLocale) {
        i18n.changeLanguage(action.payload);
    }
    return next(action);
};

export const selectAccount = store => next => action => {
    if (action.type === ACTION.SELECT_ACCOUNT && store.getState().selectedAccount.address !== action.payload.address) {
        background.selectAccount(action.payload.address).then(
            () => {
                store.dispatch(notificationSelect(true));
                setTimeout(() => store.dispatch(notificationSelect(false)), 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const deleteActiveAccount = store => next => action => {
    if (action.type === ACTION.DELETE_ACTIVE_ACCOUNT) {
        const { selectedAccount, localState } = store.getState();
        const selected =  localState.assets.account ?  localState.assets.account.address : selectedAccount.address;
        
        background.removeWallet(selected).then(
            () => {
                store.dispatch(setTab(PAGES.ROOT));
                store.dispatch(notificationDelete(true));
                setTimeout(() => store.dispatch(notificationDelete(false)), 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const deleteAccountMw = store => next => action => {
    if (action.type === ACTION.DELETE_ACCOUNT) {
        background.initVault().then(
            () => {
                store.dispatch(setTab(PAGES.ROOT));
                store.dispatch(notificationDelete(true));
                setTimeout(() => store.dispatch(notificationDelete(false)), 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const uiState = store => next => action => {
    if (action.type === ACTION.SET_UI_STATE) {
        const ui = store.getState().uiState;
        const newState = { ...ui, ...action.payload };
        background.setUiState(newState).then(
            (uiState) => {
                store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: uiState });
            }
        );
        return null;
    }

    if (action.type === ACTION.SET_UI_STATE_AND_TAB) {
        const ui = store.getState().uiState;
        const newState = { ...ui, ...action.payload.ui };
        background.setUiState(newState).then(
            (uiState) => {
                store.dispatch({ type: ACTION.UPDATE_UI_STATE, payload: uiState });
                store.dispatch(setTab(action.payload.tab));
            }
        );

        return;
    }

    return next(action);
};

export const changeNetwork = store => next => action => {
    if (action.type === ACTION.CHANGE_NETWORK) {
        background.setNetwork(action.payload).then(
            () => setTab(PAGES.ROOT)
        );
        return null;
    }

    return next(action);
};

export const getAsset = store => next => action => {
    if (action.type === ACTION.GET_ASSETS) {
        background.assetInfo(action.payload).then(
            (data) => {
                store.dispatch(updateAsset({[data.id]: data}))
            }
        );
        return null;
    }

    return next(action);
};

export const changeName = store => next => action => {
    if (action.type === ACTION.CHANGE_ACCOUNT_NAME) {
        const { address, name } = action.payload;
        background.editWalletName(address, name).then(
            () => {
                store.dispatch(notificationChangeName(true));
                setTimeout(() => store.dispatch(notificationChangeName(false)), 1000);
            }
        );
        return null;
    }

    return next(action);
};

export const setCustomNode = store => next => action => {
    if (ACTION.CHANGE_NODE === action.type) {
        const { currentNetwork } = store.getState();
        background.setCustomNode(action.payload, currentNetwork);
        return null;
    }

    return next(action);
};

export const updateNetworkCode = store => next => action => {
    if (action.type === ACTION.UPDATE_CURRENT_NETWORK || action.type === ACTION.UPDATE_NETWORKS) {
        const { payload, type } = action;
        let { networks, currentNetwork } = store.getState();

        if (type === ACTION.UPDATE_CURRENT_NETWORK) {
            currentNetwork = payload;
        }

        if (type === ACTION.UPDATE_NETWORKS) {
            networks = payload;
        }
        
        if (currentNetwork && networks && networks.length) {
            const netCode = networks.filter(({ name }) => name === currentNetwork)[0] || networks[0];
            if (netCode) {
                config.set({networkByte: netCode.code.charCodeAt(0)});
            }
        }
    }

    next(action);
};

export const lock = store => next => action => {
    if (action.type === ACTION.LOCK) {
        background.lock();
        return null;
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
    const { selectedAccount } = store.getState();
    const { messages } = store.getState();
    const message = messages.find(({ id }) => id === action.payload);
    const res = background.approve(messageId, selectedAccount);
    store.dispatch(approvePending(true));
    res.then(
        (res) => store.dispatch(approveOk({ res, message })),
        (error) => store.dispatch(approveError({ error, message })),
    ).then(
        () => store.dispatch(approvePending(message))
    )
    
};

export const reject = store => next => action => {
    if (action.type !== ACTION.REJECT) {
        return next(action);
    }
    
    const { messages } = store.getState();
    const message = messages.find(({ id }) => id === action.payload);
    
    background.reject(action.payload).then(
        () => store.dispatch(rejectOk(message))
    );
};
