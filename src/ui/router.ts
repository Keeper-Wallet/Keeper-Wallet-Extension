import { PAGES } from 'ui/pageConfig';
import { UiAction } from 'ui/store';
import { ACTION } from './actions/constants';

interface NavigateOptions {
  replace?: boolean;
}

export function navigate(delta: number): UiAction;
export function navigate(page: string, options?: NavigateOptions): UiAction;
export function navigate(
  pageOrDelta: number | string,
  { replace = false }: NavigateOptions = {}
): UiAction {
  if (typeof pageOrDelta === 'number') {
    const delta = pageOrDelta;

    return {
      type: ACTION.NAVIGATE_BACK,
      payload: { delta },
    };
  }

  const page = pageOrDelta;

  return {
    type: ACTION.NAVIGATE,
    payload: {
      page,
      replace,
    },
  };
}

const MAX_HISTORY = 10;

interface RouterState {
  backPages: string[];
  currentPage: string;
}

const initialState: RouterState = {
  backPages: [],
  currentPage: '',
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
    default:
      return state;
  }
}
