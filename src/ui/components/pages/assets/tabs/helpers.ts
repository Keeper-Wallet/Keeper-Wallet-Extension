import { useAppDispatch, useAppSelector } from '../../../../store';
import { setUiState } from '../../../../actions';

function useFilter(name: string, field: string) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.uiState[name] || {});

  function setFilter(value: any) {
    dispatch(setUiState({ [name]: { ...filters, [field]: value } }));
  }

  return [filters[field], setFilter];
}

export function useAssetFilter(field: string) {
  return useFilter('assetFilters', field);
}

export function useNftFilter(field: string) {
  return useFilter('nftFilters', field);
}
