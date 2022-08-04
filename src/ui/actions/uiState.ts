import { UiState } from 'ui/reducers/updateState';
import { ACTION } from './constants';

export function setUiState(ui: Partial<UiState>) {
  return {
    type: ACTION.SET_UI_STATE,
    payload: ui,
  };
}

export function setUiStateAndSetTab(ui: UiState, tab: string | null) {
  return {
    type: ACTION.SET_UI_STATE_AND_TAB,
    payload: { ui, tab },
  };
}
