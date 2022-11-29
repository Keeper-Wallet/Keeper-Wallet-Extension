import type { ThunkAction } from 'redux-thunk';
import { AppAction } from 'store/types';

import type { createAccountsStore } from './create';
import type { reducer } from './reducer';

export type AccountsState = ReturnType<typeof reducer>;
export type AccountsStore = ReturnType<typeof createAccountsStore>;

export type AccountsThunkAction<ReturnType> = ThunkAction<
  ReturnType,
  AccountsState,
  undefined,
  AppAction
>;
