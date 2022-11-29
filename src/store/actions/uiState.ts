import { UiState } from '../reducers/updateState';
import { ACTION } from './constants';

export function setUiState(ui: Partial<UiState>) {
  return {
    type: ACTION.SET_UI_STATE,
    payload: ui,
  };
}
