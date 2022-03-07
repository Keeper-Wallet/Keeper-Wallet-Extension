import {
  LedgerSignRequest,
  LedgerSignRequestsAddAction,
  LedgerSignRequestsClearAction,
} from 'ui/reducers/updateState';
import { ACTION } from './constants';

export function ledgerSignRequestsAddAction(
  request: LedgerSignRequest
): LedgerSignRequestsAddAction {
  return {
    type: ACTION.LEDGER_SIGN_REQUESTS_ADD,
    payload: request,
  };
}

export function ledgerSignRequestsClearAction(): LedgerSignRequestsClearAction {
  return {
    type: ACTION.LEDGER_SIGN_REQUESTS_CLEAR,
  };
}
