import { ACTION } from './constants';

export const WALLET_TYPE = {
  NEW: 'new',
  SEED: 'seed',
  KEYSTORE: 'keystore',
  KEYSTORE_WX: 'keystore_wx',
};

export type WalletTypes = typeof WALLET_TYPE[keyof typeof WALLET_TYPE];

export const sendEvent = (event: string, properties: {} = {}) => ({
  type: ACTION.SEND_EVENT,
  payload: properties,
  meta: { event },
});
