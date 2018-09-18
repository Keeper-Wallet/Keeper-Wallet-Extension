import { ACTION } from './constants';


export const setNetwork = (netName) => {
    return {
        type: ACTION.CHANGE_NETWORK,
        payload: netName
    }
};
