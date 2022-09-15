import { ACTION } from '../actions/constants';
import { navigate } from '../actions/router';
import background, { WalletTypes } from '../services/Background';
import { PAGES } from 'ui/pageConfig';
import { UiMiddleware } from 'ui/store';

export const addAccount: UiMiddleware = store => next => action => {
  const { type, payload, meta } = action;

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
