import { ACTION } from '../actions/constants';
import { setTab, addUserReceive, addUserSend } from '../actions';
import background from '../services/Background';

export const addAccount = store => next => action => {
    const { type, payload } = action;

    if (type === ACTION.SAVE_NEW_ACCOUNT) {

        const { currentNetwork, networks } = store.getState();
        const networkCode = (networks.filter(({ name }) => name === currentNetwork)[0] || networks[0]).code;

        background.addWallet({ ...payload, networkCode, currentNetwork, network: currentNetwork, lastActive: Date.now() }).then(
            () => {
                store.dispatch(addUserReceive());
                store.dispatch(setTab('assets'));
            },
            (e) => {
                store.dispatch(addUserReceive(e))
            }
        );

        store.dispatch(addUserSend());
    }

    return next(action);
};
