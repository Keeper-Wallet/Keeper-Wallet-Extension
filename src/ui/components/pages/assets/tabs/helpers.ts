import { useAppDispatch, useAppSelector } from '../../../../store';
import { setUiState } from '../../../../actions';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import {
  AssetFilters,
  NftFilters,
  TxHistoryFilters,
} from '../../../../reducers/updateState';
import * as React from 'react';

function useFilter<T, F extends keyof T>(
  name: string,
  field: F
): [Pick<T, F>[F], (value: Pick<T, F>[F]) => void] {
  const dispatch = useAppDispatch();
  const filters: T = useAppSelector(state => state.uiState[name] || {});
  const [value, setValue] = React.useState(filters[field]);
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    dispatch(setUiState({ [name]: { ...filters, [field]: value } }));
  }, [value, dispatch, setUiState]);

  return [value, setValue];
}

export function useAssetFilter<F extends keyof AssetFilters>(field: F) {
  return useFilter<AssetFilters, typeof field>('assetFilters', field);
}

export function useNftFilter<F extends keyof NftFilters>(field: F) {
  return useFilter<NftFilters, typeof field>('nftFilters', field);
}

export function useTxHistoryFilter<F extends keyof TxHistoryFilters>(field: F) {
  return useFilter<TxHistoryFilters, typeof field>('txHistoryFilters', field);
}

export function useSortedAssetEntries<T>(
  assetEntries: Array<[string, T]>
): Array<[string, T]> {
  const assets = useAppSelector(state => state.assets);
  const showSuspiciousAssets = useAppSelector(
    state => !!state.uiState?.showSuspiciousAssets
  );

  return assetEntries
    .filter(
      ([assetId]) => showSuspiciousAssets || !assets[assetId]?.isSuspicious
    )
    .sort(
      ([a], [b]) =>
        assets[a] &&
        assets[b] &&
        (+!!assets[b].isFavorite - +!!assets[a].isFavorite ||
          +!!assets[a].isSuspicious - +!!assets[b].isSuspicious ||
          (assets[a].displayName ?? '').localeCompare(
            assets[b].displayName ?? ''
          ))
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
    id: null,
    value: null,
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
