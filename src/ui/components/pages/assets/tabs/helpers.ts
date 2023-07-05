import { TRANSACTION_TYPE } from '@waves/ts-types';
import { type AssetsRecord } from 'assets/types';
import { deepEqual } from 'fast-equals';
import { type Nft, NftVendorId } from 'nfts/types';
import { useState } from 'react';
import { type TFunction } from 'react-i18next';

import {
  usePopupDispatch,
  usePopupSelector,
} from '../../../../../popup/store/react';
import { setUiState } from '../../../../../store/actions/uiState';
import { type UiState } from '../../../../../store/reducers/updateState';

export function useUiState<T extends keyof UiState>(
  key: T,
): [UiState[T] | null, (newState: UiState[T] | null) => void] {
  const dispatch = usePopupDispatch();
  const initialValue = usePopupSelector(state => state.uiState[key]);
  const [state, setState] = useState<UiState[T] | null>(initialValue);
  return [
    state,
    newState => {
      setState(newState);

      if (!deepEqual(newState, state)) {
        dispatch(setUiState({ [key]: newState }));
      }
    },
  ];
}

export function sortAssetEntries<T>(
  assetEntries: Array<[string, T]>,
  assets: AssetsRecord,
  showSuspiciousAssets: boolean | undefined,
): Array<[string, T]> {
  return assetEntries
    .filter(
      ([assetId]) => showSuspiciousAssets || !assets[assetId]?.isSuspicious,
    )
    .sort(([aAssetId], [bAssetId]) => {
      const a = assets[aAssetId];
      const b = assets[bAssetId];

      return (
        (aAssetId === 'WAVES' && -1) ||
        (bAssetId === 'WAVES' && 1) ||
        (a && b
          ? +!!b.isFavorite - +!!a.isFavorite ||
            +!!a.isSuspicious - +!!b.isSuspicious ||
            (a.displayName ?? '').localeCompare(b.displayName ?? '')
          : 0)
      );
    });
}

export function sortAndFilterNfts<T extends Nft>(
  nfts: T[],
  filters: {
    term?: string;
    creator?: string | null;
  },
) {
  const { creator, term } = filters;

  if (creator) {
    nfts = nfts.filter(nft => nft.creator === creator);
  }

  if (term) {
    nfts = nfts.filter(
      nft =>
        nft.id.toLowerCase() === term.toLowerCase() ||
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nft.creator!.toLowerCase() === term.toLowerCase() ||
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nft.displayCreator!.toLowerCase().indexOf(term.toLowerCase()) !== -1 ||
        nft.displayName.toLowerCase().indexOf(term.toLowerCase()) !== -1,
    );
  }

  const NftVendorKeys = Object.values(NftVendorId);

  return nfts.sort((a, b) => {
    return NftVendorKeys.indexOf(a.vendor) - NftVendorKeys.indexOf(b.vendor);
  });
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

export const buildTxTypeOptions = (t: TFunction<'translation', undefined>) => [
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
