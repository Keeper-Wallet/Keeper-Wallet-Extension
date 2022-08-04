import { MessageInputOfType } from 'messages/types';
import { ACTION } from './constants';

export function signAndPublishTransaction(
  transaction: MessageInputOfType<'transaction'>['data']
) {
  return {
    type: ACTION.SIGN_AND_PUBLISH_TRANSACTION,
    payload: transaction,
  };
}
