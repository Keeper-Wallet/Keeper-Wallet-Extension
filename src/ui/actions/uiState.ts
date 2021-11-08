import { ACTION } from './constants';

export function setUiState(ui) {
  return {
    type: ACTION.SET_UI_STATE,
    payload: ui,
  };
}

export function setUiStateAndSetTab(ui, tab) {
  return {
    type: ACTION.SET_UI_STATE_AND_TAB,
    payload: { ui, tab },
  };
}
