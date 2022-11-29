import { AppAction } from '../types';

export const simpleFabric =
  <TInitialState>(defaultState: TInitialState) =>
  <TActionType extends AppAction['type']>(action: TActionType) =>
  (state: TInitialState, data: AppAction) => {
    state = state == null ? defaultState : state;
    const { type, payload } = data;
    return type === action ? payload : state;
  };
