import * as styles from 'ui/components/pages/styles/assets.styl';
import { useTranslation } from 'react-i18next';
import { SearchInput, TabPanel } from 'ui/components/ui';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { useNftFilter } from './helpers';
import { Tooltip } from 'ui/components/ui/tooltip';
import { VariableSizeList } from 'react-window';
import cn from 'classnames';
import { AssetDetail } from 'ui/services/Background';
import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import { PAGES } from 'ui/pageConfig';
import { setTab } from 'ui/actions';

const PLACEHOLDERS = [...Array(4).keys()].map<AssetDetail>(
  key =>
    ({
      id: `${key}`,
    } as AssetDetail)
);

export function TabNfts({
  onInfoClick,
  onSendClick,
}: {
  onInfoClick: (assetId: string) => void;
  onSendClick: (assetId: string) => void;
}) {
  const { t } = useTranslation();
  const address = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[address]?.nfts);

  const dispatch = useAppDispatch();

  const {
    term: [term, setTerm],
    onlyMy: [onlyMy, setOnlyMy],
    clearFilters,
  } = useNftFilter();

  const listRef = React.useRef<VariableSizeList>();

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [myNfts]);

  const sortedNfts = myNfts
    ? myNfts
        // .filter(
        //   nft =>
        //     (!onlyMy || nft.issuer === address) &&
        //     (!term || nft.id === term || icontains(nft.displayName, term))
        // )
        .sort(
          (a, b) =>
            (a.issuer ?? '').localeCompare(b.issuer ?? '') ||
            (a.displayName ?? '').localeCompare(b.displayName ?? '')
        )
    : PLACEHOLDERS;
  return (
    <TabPanel className={styles.assetsPanel}>
      <div className={styles.filterContainer}>
        <SearchInput
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
        <Tooltip content={t('assets.onlyMyAssets')}>
          {props => (
            <div
              className={styles.filterBtn}
              onClick={() => {
                listRef.current && listRef.current.resetAfterIndex(0);
                setOnlyMy(!onlyMy);
              }}
              {...props}
            >
              <svg
                className={styles.filterBtnIcon}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  fill={
                    onlyMy ? 'var(--color-submit400)' : 'var(--color-basic500)'
                  }
                  fillOpacity=".01"
                  d="M0 0h14v14H0z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                  fill={
                    onlyMy ? 'var(--color-submit400)' : 'var(--color-basic500)'
                  }
                />
              </svg>
            </div>
          )}
        </Tooltip>
      </div>
      {sortedNfts.length === 0 ? (
        <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
          {term || onlyMy ? (
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
          mode={onlyMy ? DisplayMode.Creator : DisplayMode.Name}
          listRef={listRef}
          sortedNfts={sortedNfts}
          onInfoClick={() => dispatch(setTab(PAGES.NFT_COLLECTION))}
          onSendClick={onSendClick}
        />
      )}
    </TabPanel>
  );
}
