import { PAGES } from 'ui/pageConfig';
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
    case ACTION.NAVIGATE_BACK: {
      const { delta } = action.payload;

      if (delta >= 0) {
        throw new Error('delta must be negative');
      }

      const prevPage =
        state.backPages[state.backPages.length + delta] || PAGES.ROOT;

      return {
        ...state,
        currentPage: prevPage,
        backPages: state.backPages.slice(0, delta),
      };
    }
    case ACTION.ADD_BACK_PAGE:
      return {
        ...state,
        backPages: [...state.backPages, action.payload].slice(-MAX_HISTORY),
      };
    default:
      return state;
  }
}
