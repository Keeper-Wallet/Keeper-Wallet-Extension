import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AccountsState, AccountsStore } from './types';

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
  useSelector;

export const useAccountsDispatch = () =>
  useDispatch<AccountsStore['dispatch']>();
