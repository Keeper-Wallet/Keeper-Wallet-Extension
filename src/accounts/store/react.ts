import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AccountsState, AccountsStore } from './types';

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
  useSelector;

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>();
