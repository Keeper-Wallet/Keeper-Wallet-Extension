import { ACTION } from '../actions/constants';
import background from '../services/Background';
import { i18n } from '../i18n';

export const changeLang = store => next => action => {
    if (action.type === ACTION.CHANGE_LNG && action.payload !== store.currentLocale) {
        background.setCurrentLocale(action.payload);
    }
    return next(action);
};

export const updateLang = store => next => action => {
    if (action.type === ACTION.UPDATE_FROM_LNG && action.payload !== store.currentLocale) {
        i18n.changeLanguage(action.payload);
    }
    return next(action);
};

export const changeTab = store => next => action => {
    if (action.type === ACTION.CHANGE_TAB && action.payload !== store.tab) {
        background.setUiState({...store.uiState, tab: action.payload });
    }
    return next(action);
};

export const setPassword = store => next => action => {
    if (action.type === ACTION.SET_PASSWORD) {
        background.initVault(action.payload);
    }
    
    return next(action);
};
