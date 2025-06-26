import { type NetworkProfile } from '../../networks/types';
import { type PopupThunkAction } from '../../popup/store/types';
import Background from '../../ui/services/Background';
import { ACTION } from './constants';

export function setNetwork(
  network: NetworkProfile,
): PopupThunkAction<Promise<void>> {
  return async () => {
    await Background.setNetwork(network);
  };
}

export const setCustomNode = (payload: {
  network: string;
  node: string | null;
}) => {
  return {
    type: ACTION.CHANGE_NODE,
    payload,
  };
};

export const setCustomCode = (payload: {
  network: string;
  code: string | null;
}) => {
  return {
    type: ACTION.CHANGE_NETWORK_CODE,
    payload,
  };
};

export const setCustomMatcher = (payload: {
  network: string;
  matcher: string | null;
}) => {
  return {
    type: ACTION.CHANGE_MATCHER,
    payload,
  };
};
