import { UiAction } from 'ui/store';
import { ACTION } from './constants';

interface NavigateOptions {
  replace?: boolean;
}

export function navigate(delta: number): UiAction;
export function navigate(
  page: string | null,
  options?: NavigateOptions
): UiAction;
export function navigate(
  pageOrDelta: number | string | null,
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
