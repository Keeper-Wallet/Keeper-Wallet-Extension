import { ACTION, addBackTab, selectAccount, navigate } from '../actions';
import background, { WalletTypes } from '../services/Background';
import { PAGES } from 'ui/pageConfig';
import { UiMiddleware } from 'ui/store';

export const addAccount: UiMiddleware = store => next => action => {
  const { type, payload, meta } = action;
  const { currentNetwork, networks, tab: currentTab } = store.getState();

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

        store.dispatch(addBackTab(currentTab));
        store.dispatch(navigate(PAGES.IMPORT_SUCCESS));

        if (meta.type !== WalletTypes.Debug) {
          background.sendEvent('addWallet', { type: meta.type });
        }
      });
  }

  if (type === ACTION.BATCH_ADD_ACCOUNTS) {
    Promise.all(payload.map(account => background.addWallet(account))).then(
      () => {
        store.dispatch(addBackTab(currentTab));
        store.dispatch(navigate(PAGES.IMPORT_SUCCESS));

        if (meta.type !== WalletTypes.Debug) {
          background.sendEvent('addWallet', { type: meta.type });
        }
      }
    );
  }

  return next(action);
};
