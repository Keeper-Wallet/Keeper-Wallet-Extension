import { ACTION, addUserReceive, addUserSend, setTab } from '../actions';
import background from '../services/Background';

export const addAccount = store => next => action => {
  const { type, payload, meta } = action;

  if (type === ACTION.SAVE_NEW_ACCOUNT) {
    const { currentNetwork, networks } = store.getState();
    const networkCode = (
      networks.filter(({ name }) => name === currentNetwork)[0] || networks[0]
    ).code;

    background
      .addWallet({
        ...payload,
        networkCode,
        currentNetwork,
        network: currentNetwork,
        lastActive: Date.now(),
      })
      .then(
        () => {
          store.dispatch(addUserReceive());
          store.dispatch(setTab('assets'));
          background.sendEvent('addWallet', { type: meta.type });
        },
        e => {
          store.dispatch(addUserReceive(e));
        }
      );

    store.dispatch(addUserSend());
  }

  if (type === ACTION.BATCH_ADD_ACCOUNTS) {
    Promise.all(
      payload.map(account =>
        background.addWallet({ ...account, lastActive: Date.now() })
      )
    ).then(() => {
      store.dispatch(setTab('assets'));
      background.sendEvent('addWallet', { type: meta.type });
    });
  }

  return next(action);
};
