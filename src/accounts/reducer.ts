import { combineReducers } from 'redux';

import {
  accounts,
  addresses,
  allNetworksAccounts,
  currentLocale,
  currentNetwork,
  customCodes,
  customMatcher,
  customNodes,
  idleOptions,
  localState,
  networks,
  selectedAccount,
  state,
  uiState,
  version,
} from '../ui/reducers/updateState';

export const reducer = combineReducers({
  accounts,
  addresses,
  allNetworksAccounts,
  currentLocale,
  currentNetwork,
  customCodes,
  customMatcher,
  customNodes,
  idleOptions,
  localState,
  networks,
  selectedAccount,
  state,
  uiState,
  version,
});
