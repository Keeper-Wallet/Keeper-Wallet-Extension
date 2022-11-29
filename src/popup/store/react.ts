import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { PopupState, PopupStore } from './types';

export const useAppSelector: TypedUseSelectorHook<PopupState> = useSelector;
export const useAppDispatch = () => useDispatch<PopupStore['dispatch']>();
