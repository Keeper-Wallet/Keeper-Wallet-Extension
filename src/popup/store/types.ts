import type { ThunkAction } from 'redux-thunk';

import type { AppAction } from '../../store/types';
import type { createPopupStore } from './create';
import type { reducer } from './reducer';

export type PopupState = ReturnType<typeof reducer>;

export type PopupStore = ReturnType<typeof createPopupStore>;

export type PopupThunkAction<ReturnType> = ThunkAction<
  ReturnType,
  PopupState,
  undefined,
  AppAction
>;
