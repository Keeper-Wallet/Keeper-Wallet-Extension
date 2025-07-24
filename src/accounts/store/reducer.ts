import { combineReducers } from 'redux';

import {
  accounts,
  addresses,
  allNetworksAccounts,
  currentLocale,
  currentNetwork,
  currentProfile,
  customCodes,
  customMatcher,
  customNodes,
  idleOptions,
  localState,
  selectedAccount,
  state,
  uiState,
  selectedNetworkFilter,
} from '../../store/reducers/updateState';

export const reducer = combineReducers({
  accounts,
  addresses,
  allNetworksAccounts,
  currentLocale,
  currentNetwork,
  currentProfile,
  customCodes,
  customMatcher,
  customNodes,
  idleOptions,
  localState,
  selectedAccount,
  state,
  uiState,
  selectedNetworkFilter,
});
