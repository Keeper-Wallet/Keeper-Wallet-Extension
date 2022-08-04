import { UiActionOfType } from 'ui/store';
import { ACTION } from './constants';

export const allowOrigin = (
  origin: string
): UiActionOfType<typeof ACTION.PERMISSIONS.ALLOW> => ({
  type: ACTION.PERMISSIONS.ALLOW,
  payload: origin,
});

export const setAutoOrigin = (origin: {
  origin: string | undefined;
  params: Partial<{
    type: 'allowAutoSign';
    totalAmount: string | null;
    interval: number | null;
    approved?: unknown[];
  }>;
}): UiActionOfType<typeof ACTION.PERMISSIONS.SET_AUTO> => ({
  type: ACTION.PERMISSIONS.SET_AUTO,
  payload: origin,
});

export const disableOrigin = (
  origin: string
): UiActionOfType<typeof ACTION.PERMISSIONS.DISALLOW> => ({
  type: ACTION.PERMISSIONS.DISALLOW,
  payload: origin,
});

export const deleteOrigin = (
  origin: string
): UiActionOfType<typeof ACTION.PERMISSIONS.DELETE> => ({
  type: ACTION.PERMISSIONS.DELETE,
  payload: origin,
});

export const pendingOrigin = (
  state: boolean
): UiActionOfType<typeof ACTION.PERMISSIONS.PENDING> => ({
  type: ACTION.PERMISSIONS.PENDING,
  payload: state,
});

export const allowOriginDone = (
  state: unknown
): UiActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});

export const autoOriginDone = (
  state: unknown
): UiActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_AUTO> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_AUTO,
  payload: state,
});

export const disallowOriginDone = (
  state: unknown
): UiActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});

export const deleteOriginDone = (
  state: unknown
): UiActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});

export const setOriginAutoSignDone = (
  state: unknown
): UiActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});
