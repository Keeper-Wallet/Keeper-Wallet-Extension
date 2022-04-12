import { ACTION, addBackTab, selectAccount, setTab } from '../actions';
import background from '../services/Background';
import { PAGES } from 'ui/pageConfig';

export const addAccount = store => next => action => {
  const { type, payload, meta } = action;
  const { currentNetwork, networks, tab: currentTab } = store.getState();

  if (type === ACTION.SAVE_NEW_ACCOUNT) {
    const networkCode = (
      networks.filter(({ name }) => name === currentNetwork)[0] || networks[0]
    ).code;

    background
      .addWallet({ ...payload, networkCode, network: currentNetwork })
      .then(lastAccount => {
        store.dispatch(selectAccount(lastAccount));

        store.dispatch(addBackTab(currentTab));
        store.dispatch(setTab(PAGES.IMPORT_SUCCESS));

        background.sendEvent('addWallet', { type: meta.type });
      });
  }

  if (type === ACTION.BATCH_ADD_ACCOUNTS) {
    Promise.all(payload.map(account => background.addWallet(account))).then(
      () => {
        store.dispatch(addBackTab(currentTab));
        store.dispatch(setTab(PAGES.IMPORT_SUCCESS));

        background.sendEvent('addWallet', { type: meta.type });
      }
    );
  }

  return next(action);
};
