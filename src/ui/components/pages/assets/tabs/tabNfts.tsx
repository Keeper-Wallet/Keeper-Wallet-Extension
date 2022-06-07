import * as styles from 'ui/components/pages/styles/assets.styl';
import { useTranslation } from 'react-i18next';
import { SearchInput, TabPanel } from 'ui/components/ui';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { sortAndFilterNfts, useUiState } from './helpers';
import { VariableSizeList } from 'react-window';
import cn from 'classnames';
import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import { PAGES } from 'ui/pageConfig';
import { setTab } from 'ui/actions';
import { createNft, Nft } from 'nfts/utils';

const PLACEHOLDERS = [...Array(4).keys()].map<Nft>(
  key =>
    ({
      id: `${key}`,
    } as Nft)
);

export function TabNfts() {
  const { t } = useTranslation();

  const currentAddress = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[currentAddress]?.nfts);
  const nfts = useAppSelector(state => state.nfts);

  const dispatch = useAppDispatch();

  const [filters, setFilters] = useUiState('nftFilters');
  const [term, setTerm] = [
    filters?.term,
    value => setFilters({ ...filters, term: value }),
  ];
  const setCreator = value => setFilters({ ...filters, creator: value });

  const listRef = React.useRef<VariableSizeList>();

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id], currentAddress),
    [nfts, currentAddress]
  );

  const sortedNfts = myNfts
    ? sortAndFilterNfts(myNfts.map(getNftDetails), { term })
    : PLACEHOLDERS;

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [sortedNfts]);

  const [creatorNfts, creatorCounts] = sortedNfts.reduce<
    [Nft[], Record<string, number>]
  >(
    ([creatorNfts, creatorCounts], current) => {
      const creator = current.creator;
      if (Object.prototype.hasOwnProperty.call(creatorCounts, creator)) {
        creatorCounts[creator] += 1;
        return [creatorNfts, creatorCounts];
      }

      creatorCounts[creator] = 1;
      creatorNfts.push(current);

      return [creatorNfts, creatorCounts];
    },
    [[], {}]
  );

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
      </div>
      {sortedNfts.length === 0 ? (
        <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
          {term ? (
            <>
              <div className="margin-min">{t('assets.notFoundNFTs')}</div>
              <p className="blue link" onClick={() => setFilters(null)}>
                {t('assets.resetFilters')}
              </p>
            </>
          ) : (
            t('assets.emptyNFTs')
          )}
        </div>
      ) : (
        <NftList
          mode={DisplayMode.Creator}
          listRef={listRef}
          nfts={creatorNfts}
          counters={creatorCounts}
          onClick={(asset: Nft) => {
            setCreator(asset.creator);
            dispatch(setTab(PAGES.NFT_COLLECTION));
          }}
        />
      )}
    </TabPanel>
  );
}
