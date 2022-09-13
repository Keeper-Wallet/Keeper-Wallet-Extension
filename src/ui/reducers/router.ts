import { ACTION } from '../actions';
import { UiAction } from '../store';

const MAX_HISTORY = 10;

interface RouterState {
  backPages: Array<string | null>;
  currentPage: string | null;
}

const initialState: RouterState = {
  backPages: [],
  currentPage: null,
};

export function router(state = initialState, action: UiAction): RouterState {
  switch (action.type) {
    case ACTION.NAVIGATE:
      return {
        ...state,
        currentPage: action.payload.page,
        backPages: action.payload.replace
          ? state.backPages
          : [...state.backPages, state.currentPage].slice(-MAX_HISTORY),
      };
    case ACTION.ADD_BACK_PAGE:
      return {
        ...state,
        backPages: [...state.backPages, action.payload].slice(-MAX_HISTORY),
      };
    case ACTION.REMOVE_BACK_PAGE:
      return {
        ...state,
        backPages: state.backPages.slice(0, -1),
      };
    default:
      return state;
  }
}
