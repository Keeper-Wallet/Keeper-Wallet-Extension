import { IState } from '../store';

export const updateState = (store = {} as IState, action: any) => {

    if (action.type === 'UPDATE_STATE') {
        return { ...store, ...action.payload };
    }

    if (action.type === 'SET_TAB') {
        const tab = action.payload;
        const uiState = { ...store.uiState, tab };
        return { ...store, uiState };
    }

    return store;
};


