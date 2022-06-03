import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import * as React from 'react';
import { VariableSizeList } from 'react-window';
import { PAGES } from 'ui/pageConfig';
import * as styles from './nftCollection.module.css';
import { SearchInput } from 'ui/components/ui';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { AssetDetail } from 'ui/services/Background';
import { useNftFilter } from 'ui/components/pages/assets/tabs/helpers';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { NftHeader } from 'ui/components/pages/nfts/nftHeader';
import { setUiState } from 'ui/actions';
import { createNft, Nft } from 'nfts/utils';

const PLACEHOLDERS = [...Array(4).keys()].map<AssetDetail>(
  key =>
    ({
      id: `${key}`,
    } as AssetDetail)
);

export function NftCollection({
  setTab,
}: {
  setTab: (newTab: string) => void;
}) {
  const { t } = useTranslation();
  const listRef = React.useRef<VariableSizeList>();

  const address = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[address]?.nfts);
  const nfts = useAppSelector(state => state.nfts);

  const dispatch = useAppDispatch();

  const [, setCurrentAsset] = [
    useAppSelector(state => state.uiState?.currentAsset),
    (asset: AssetDetail | Nft) => dispatch(setUiState({ currentAsset: asset })),
  ];

  const {
    term: [term, setTerm],
    creator: [creator],
    clearFilters,
  } = useNftFilter();

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [myNfts]);

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id]),
    [nfts]
  );

  const creatorNfts = myNfts
    ? myNfts.map(getNftDetails).filter(nft => nft.creator === creator)
    : PLACEHOLDERS;

  return (
    <div className={styles.root}>
      <NftHeader
        title={'Nft collection name is very long so we should ellipsis this'}
        creator={'@VeryLongCreatorName'}
      />

      <div className={styles.content}>
        <div className={styles.filterContainer}>
          <SearchInput
            autoFocus
            className={styles.searchInput}
            value={term ?? ''}
            onInput={e => {
              listRef.current && listRef.current.resetAfterIndex(0);
              setTerm(e.target.value);
            }}
            onClear={() => {
              listRef.current && listRef.current.resetAfterIndex(0);
              setTerm('');
            }}
          />
        </div>

        {creatorNfts.length === 0 ? (
          <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
            {term ? (
              <>
                <div className="margin-min">{t('assets.notFoundNFTs')}</div>
                <p className="blue link" onClick={() => clearFilters()}>
                  {t('assets.resetFilters')}
                </p>
              </>
            ) : (
              t('assets.emptyNFTs')
            )}
          </div>
        ) : (
          <NftList
            mode={DisplayMode.Name}
            listRef={listRef}
            nfts={creatorNfts}
            onClick={(asset: Nft) => {
              setCurrentAsset(asset);
              setTab(PAGES.NFT_INFO);
            }}
          />
        )}
      </div>
    </div>
  );
}
