import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';

import type { PopupState, PopupStore } from './types';

export const usePopupSelector: TypedUseSelectorHook<PopupState> = useSelector;
export const usePopupDispatch = () => useDispatch<PopupStore['dispatch']>();
