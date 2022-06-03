import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import * as React from 'react';
import { VariableSizeList } from 'react-window';
import { PAGES } from 'ui/pageConfig';
import * as styles from './nftCollection.module.css';
import { SearchInput } from 'ui/components/ui';
import { useAppSelector } from 'ui/store';
import { AssetDetail } from 'ui/services/Background';
import { useNftFilter } from 'ui/components/pages/assets/tabs/helpers';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { NftHeader } from 'ui/components/pages/nfts/nftHeader';

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

  const {
    term: [term, setTerm],
    clearFilters,
  } = useNftFilter();

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [myNfts]);

  const sortedNfts = myNfts
    ? myNfts.sort(
        (a, b) =>
          (a.issuer ?? '').localeCompare(b.issuer ?? '') ||
          (a.displayName ?? '').localeCompare(b.displayName ?? '')
      )
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

        {sortedNfts.length === 0 ? (
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
            sortedNfts={sortedNfts}
            onInfoClick={() => setTab(PAGES.NFT_INFO)}
            onSendClick={() => void 0}
          />
        )}
      </div>
    </div>
  );
}
