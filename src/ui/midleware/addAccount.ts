import {
  ACTION,
  notificationAccountCreationSuccess,
  notificationAccountImportSuccess,
  setTab,
} from '../actions';
import background, { WalletTypes } from '../services/Background';

export const addAccount = store => next => action => {
  const { type, payload, meta } = action;

  if (type === ACTION.SAVE_NEW_ACCOUNT) {
    const { currentNetwork, networks } = store.getState();
    const networkCode = (
      networks.filter(({ name }) => name === currentNetwork)[0] || networks[0]
    ).code;

    background
      .addWallet({ ...payload, networkCode, network: currentNetwork })
      .then(() => {
        store.dispatch(setTab('import')); // todo: redirect to success page

        if (meta.type === WalletTypes.New) {
          store.dispatch(notificationAccountCreationSuccess(true));
          setTimeout(() => {
            store.dispatch(notificationAccountCreationSuccess(false));
          }, 1000);
        } else {
          store.dispatch(notificationAccountImportSuccess(true));
          setTimeout(() => {
            store.dispatch(notificationAccountImportSuccess(false));
          }, 1000);
        }

        background.sendEvent('addWallet', { type: meta.type });
      });
  }

  if (type === ACTION.BATCH_ADD_ACCOUNTS) {
    Promise.all(payload.map(account => background.addWallet(account))).then(
      () => {
        store.dispatch(setTab('import')); // todo: redirect to success page
        store.dispatch(notificationAccountImportSuccess(true));
        setTimeout(() => {
          store.dispatch(notificationAccountImportSuccess(false));
        }, 1000);
        background.sendEvent('addWallet', { type: meta.type });
      }
    );
  }

  return next(action);
};
