import { useAppDispatch, useAppSelector } from '../../../../store';
import { setUiState } from '../../../../actions';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { UiState } from '../../../../reducers/updateState';
import * as React from 'react';
import { AssetDetail } from '../../../../services/Background';
import { equals } from 'ramda';

export function useUiState<T extends keyof UiState>(
  key: T
): [UiState[T], (newState: UiState[T]) => void] {
  const dispatch = useAppDispatch();
  const initialValue = useAppSelector(state => state.uiState[key]);
  const [state, setState] = React.useState(initialValue);
  return [
    state,
    newState => {
      setState(newState);

      if (!equals(newState, state)) {
        dispatch(setUiState({ [key]: newState }));
      }
    },
  ];
}

export function sortAssetEntries<T>(
  assetEntries: Array<[string, T]>,
  assets: Record<string, AssetDetail>,
  showSuspiciousAssets: boolean
): Array<[string, T]> {
  return assetEntries
    .filter(
      ([assetId]) => showSuspiciousAssets || !assets[assetId]?.isSuspicious
    )
    .sort(
      ([a], [b]) =>
        (a === 'WAVES' && -1) ||
        (b === 'WAVES' && 1) ||
        (assets[a] &&
          assets[b] &&
          (+!!assets[b].isFavorite - +!!assets[a].isFavorite ||
            +!!assets[a].isSuspicious - +!!assets[b].isSuspicious ||
            (assets[a].displayName ?? '').localeCompare(
              assets[b].displayName ?? ''
            )))
    );
}

export const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const buildTxTypeOptions = t => [
  {
    id: 0,
    value: 0,
    text: t('historyFilters.all'),
  },
  {
    id: TRANSACTION_TYPE.ISSUE,
    value: TRANSACTION_TYPE.ISSUE,
    text: t('historyFilters.issue'),
  },
  {
    id: TRANSACTION_TYPE.TRANSFER,
    value: TRANSACTION_TYPE.TRANSFER,
    text: t('historyFilters.transfer'),
  },
  {
    id: TRANSACTION_TYPE.REISSUE,
    value: TRANSACTION_TYPE.REISSUE,
    text: t('historyFilters.reissue'),
  },
  {
    id: TRANSACTION_TYPE.BURN,
    value: TRANSACTION_TYPE.BURN,
    text: t('historyFilters.burn'),
  },
  {
    id: TRANSACTION_TYPE.EXCHANGE,
    value: TRANSACTION_TYPE.EXCHANGE,
    text: t('historyFilters.exchange'),
  },
  {
    id: TRANSACTION_TYPE.LEASE,
    value: TRANSACTION_TYPE.LEASE,
    text: t('historyFilters.lease'),
  },
  {
    id: TRANSACTION_TYPE.CANCEL_LEASE,
    value: TRANSACTION_TYPE.CANCEL_LEASE,
    text: t('historyFilters.cancelLease'),
  },
  {
    id: TRANSACTION_TYPE.ALIAS,
    value: TRANSACTION_TYPE.ALIAS,
    text: t('historyFilters.alias'),
  },
  {
    id: TRANSACTION_TYPE.MASS_TRANSFER,
    value: TRANSACTION_TYPE.MASS_TRANSFER,
    text: t('historyFilters.massTransfer'),
  },
  {
    id: TRANSACTION_TYPE.DATA,
    value: TRANSACTION_TYPE.DATA,
    text: t('historyFilters.data'),
  },
  {
    id: TRANSACTION_TYPE.SET_SCRIPT,
    value: TRANSACTION_TYPE.SET_SCRIPT,
    text: t('historyFilters.setScript'),
  },
  {
    id: TRANSACTION_TYPE.SPONSORSHIP,
    value: TRANSACTION_TYPE.SPONSORSHIP,
    text: t('historyFilters.sponsorship'),
  },
  {
    id: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
    value: TRANSACTION_TYPE.SET_ASSET_SCRIPT,
    text: t('historyFilters.setAssetScript'),
  },
  {
    id: TRANSACTION_TYPE.INVOKE_SCRIPT,
    value: TRANSACTION_TYPE.INVOKE_SCRIPT,
    text: t('historyFilters.invokeScript'),
  },
  {
    id: TRANSACTION_TYPE.UPDATE_ASSET_INFO,
    value: TRANSACTION_TYPE.UPDATE_ASSET_INFO,
    text: t('historyFilters.updateAssetInfo'),
  },
];

const CARD_HEIGHT = 64;
const CARD_MARGIN_BOTTOM = 8;
export const CARD_FULL_HEIGHT = CARD_HEIGHT + CARD_MARGIN_BOTTOM;

const MARGIN_MIN = 4;
const MARGIN_MIN_TOP = MARGIN_MIN;
const GROUP_HEIGHT = 14;
export const FULL_GROUP_HEIGHT = MARGIN_MIN_TOP + GROUP_HEIGHT + MARGIN_MIN;
