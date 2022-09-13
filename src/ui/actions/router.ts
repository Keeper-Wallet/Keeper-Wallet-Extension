import { ACTION } from './constants';

export function navigate(
  page: string | null,
  { replace = false }: { replace?: boolean } = {}
) {
  return {
    type: ACTION.NAVIGATE,
    payload: {
      page,
      replace,
    },
  };
}

export function addBackTab(tab: string | null) {
  return {
    type: ACTION.ADD_BACK_PAGE,
    payload: tab,
  };
}

export function removeBackTab() {
  return {
    type: ACTION.REMOVE_BACK_TAB,
  };
}
