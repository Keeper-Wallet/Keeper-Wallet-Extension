import { ACTION } from '../actions';
import { UiAction } from 'ui/store';

const MAX_HISTORY = 10;

export function tab(state: string | null = null, action: UiAction) {
  switch (action.type) {
    case ACTION.NAVIGATE:
      return action.payload.page;
    default:
      return state;
  }
}

export function backTabs(
  state: Array<string | null> = [],
  { type, payload }: UiAction
) {
  switch (type) {
    case ACTION.ADD_BACK_PAGE:
      return [...state, payload].slice(-MAX_HISTORY);
    case ACTION.REMOVE_BACK_PAGE:
      return state.slice(0, -1);
    default:
      return state;
  }
}
