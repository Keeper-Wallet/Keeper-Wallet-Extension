import { UiAction } from 'ui/store';

export const simpleFabric =
  <TInitialState>(defaultState: TInitialState) =>
  <TActionType extends UiAction['type']>(action: TActionType) =>
  (state: TInitialState, data: UiAction) => {
    state = state == null ? defaultState : state;
    const { type, payload } = data;
    return type === action ? payload : state;
  };
