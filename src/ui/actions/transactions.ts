import { ACTION } from './constants';

export function signAndPublishTransaction(
  transaction: WavesKeeper.TSignTransactionData
) {
  return {
    type: ACTION.SIGN_AND_PUBLISH_TRANSACTION,
    payload: transaction,
  };
}
