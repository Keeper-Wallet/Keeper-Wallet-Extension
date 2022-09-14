import { ACTION, selectAccount, navigate } from '../actions';
import background, { WalletTypes } from '../services/Background';
import { PAGES } from 'ui/pageConfig';
import { UiMiddleware } from 'ui/store';

export const addAccount: UiMiddleware = store => next => action => {
  const { type, payload, meta } = action;
  const { currentNetwork, networks } = store.getState();

  if (type === ACTION.SAVE_NEW_ACCOUNT) {
    const networkCode = (
      networks.filter(({ name }) => name === currentNetwork)[0] || networks[0]
    ).code;

    background
      .addWallet({
        ...payload,
        networkCode,
        network: currentNetwork,
      })
      .then(lastAccount => {
        store.dispatch(selectAccount(lastAccount));
        store.dispatch(navigate(PAGES.IMPORT_SUCCESS));

        if (meta.type !== WalletTypes.Debug) {
          background.sendEvent('addWallet', { type: meta.type });
        }
      });
  }

  if (type === ACTION.BATCH_ADD_ACCOUNTS) {
    Promise.all(payload.map(account => background.addWallet(account))).then(
      () => {
        store.dispatch(navigate(PAGES.IMPORT_SUCCESS_KEYSTORE));

        if (meta.type !== WalletTypes.Debug) {
          background.sendEvent('addWallet', { type: meta.type });
        }
      }
    );
  }

  return next(action);
};
