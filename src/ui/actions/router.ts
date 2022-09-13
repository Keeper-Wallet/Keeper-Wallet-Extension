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

export function addBackPage(page: string | null) {
  return {
    type: ACTION.ADD_BACK_PAGE,
    payload: page,
  };
}

export function removeBackPage() {
  return {
    type: ACTION.REMOVE_BACK_PAGE,
  };
}
