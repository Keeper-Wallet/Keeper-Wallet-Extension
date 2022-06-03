import { useAppDispatch, useAppSelector } from '../../../../store';
import { setUiState } from '../../../../actions';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import {
  AssetFilters,
  NftFilters,
  TxHistoryFilters,
} from '../../../../reducers/updateState';
import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { AssetDetail } from '../../../../services/Background';

function useFilter<T, F extends keyof T>(name: string, fields: F[]) {
  const dispatch = useAppDispatch();
  const stateFilters: T = useAppSelector(state => state.uiState[name] || {});

  const manageFilters = fields.reduce<{
    [K in keyof T]?: [Pick<T, K>[K], Dispatch<SetStateAction<Pick<T, K>[K]>>];
  }>((manage, field) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    manage[field] = React.useState<Pick<T, F>[F]>(stateFilters[field]);
    return manage;
  }, {});

  const valueFilters = fields.reduce<{ [K in F]?: Pick<T, K>[K] }>(
    (newFilters, field) => {
      newFilters[field] = manageFilters[field][0];
      return newFilters;
    },
    {}
  );

  React.useEffect(() => {
    if (
      fields.reduce(
        (isEqualEachFilter, field) =>
          isEqualEachFilter && valueFilters[field] == stateFilters[field],
        true
      )
    ) {
      return;
    }

    dispatch(setUiState({ [name]: valueFilters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueFilters, stateFilters, dispatch, setUiState]);

  return {
    ...manageFilters,
    clearFilters: () => {
      fields.forEach(field => manageFilters[field][1](null));
    },
  };
}

export function useAssetFilter() {
  return useFilter<AssetFilters, keyof AssetFilters>('assetFilters', [
    'term',
    'onlyMy',
    'onlyFavorites',
  ]);
}

export function useNftFilter() {
  return useFilter<NftFilters, keyof NftFilters>('nftFilters', ['term']);
}

export function useTxHistoryFilter() {
  return useFilter<TxHistoryFilters, keyof TxHistoryFilters>(
    'txHistoryFilters',
    ['term', 'type', 'onlyIncoming', 'onlyOutgoing']
  );
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
