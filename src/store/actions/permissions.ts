import { type AppActionOfType } from '../types';
import { ACTION } from './constants';

export const allowOrigin = (
  origin: string,
): AppActionOfType<typeof ACTION.PERMISSIONS.ALLOW> => ({
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
}): AppActionOfType<typeof ACTION.PERMISSIONS.SET_AUTO> => ({
  type: ACTION.PERMISSIONS.SET_AUTO,
  payload: origin,
});

export const disableOrigin = (
  origin: string,
): AppActionOfType<typeof ACTION.PERMISSIONS.DISALLOW> => ({
  type: ACTION.PERMISSIONS.DISALLOW,
  payload: origin,
});

export const deleteOrigin = (
  origin: string,
): AppActionOfType<typeof ACTION.PERMISSIONS.DELETE> => ({
  type: ACTION.PERMISSIONS.DELETE,
  payload: origin,
});

export const pendingOrigin = (
  state: boolean,
): AppActionOfType<typeof ACTION.PERMISSIONS.PENDING> => ({
  type: ACTION.PERMISSIONS.PENDING,
  payload: state,
});

export const allowOriginDone = (
  state: unknown,
): AppActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});

export const autoOriginDone = (
  state: unknown,
): AppActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_AUTO> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_AUTO,
  payload: state,
});

export const disallowOriginDone = (
  state: unknown,
): AppActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});

export const deleteOriginDone = (
  state: unknown,
): AppActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});

export const setOriginAutoSignDone = (
  state: unknown,
): AppActionOfType<typeof ACTION.PERMISSIONS.CONFIRMED_ALLOW> => ({
  type: ACTION.PERMISSIONS.CONFIRMED_ALLOW,
  payload: state,
});
