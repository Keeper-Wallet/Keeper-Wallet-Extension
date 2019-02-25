import { ACTION } from './constants';


export const setNetwork = (netName) => {
    return {
        type: ACTION.CHANGE_NETWORK,
        payload: netName
    }
};

export const setCustomNode = payload => {
    return {
        type: ACTION.CHANGE_NODE,
        payload
    }
};

export const setCustomCode = payload => {
    return {
        type: ACTION.CHANGE_NETWORK_CODE,
        payload
    }
};

export const setCustomMatcher = payload => {
    return {
        type: ACTION.CHANGE_MATCHER,
        payload
    }
};
