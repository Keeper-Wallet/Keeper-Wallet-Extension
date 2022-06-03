import * as styles from 'ui/components/pages/styles/assets.styl';
import { useTranslation } from 'react-i18next';
import { SearchInput, TabPanel } from 'ui/components/ui';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { useNftFilter } from './helpers';
import { VariableSizeList } from 'react-window';
import cn from 'classnames';
import { AssetDetail } from 'ui/services/Background';
import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import { PAGES } from 'ui/pageConfig';
import { setTab } from 'ui/actions';
import { createNft, Nft } from 'nfts/utils';

const PLACEHOLDERS = [...Array(4).keys()].map<AssetDetail>(
  key =>
    ({
      id: `${key}`,
    } as AssetDetail)
);

export function TabNfts() {
  const { t } = useTranslation();

  const address = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[address]?.nfts);
  const nfts = useAppSelector(state => state.nfts);

  const dispatch = useAppDispatch();

  const {
    term: [term, setTerm],
    creator: [creator, setCreator],
    clearFilters,
  } = useNftFilter();

  const listRef = React.useRef<VariableSizeList>();

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

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id]),
    [nfts]
  );

  const [creatorNfts, creatorCounts] = sortedNfts.reduce<
    [Nft[], Record<string, number>]
  >(
    ([creatorNfts, creatorCounts], current) => {
      const currentDetails = getNftDetails(current);
      const creator = currentDetails.creator;
      if (Object.prototype.hasOwnProperty.call(creatorCounts, creator)) {
        creatorCounts[creator] += 1;
        return [creatorNfts, creatorCounts];
      }

      creatorCounts[creator] = 1;
      creatorNfts.push(currentDetails);

      return [creatorNfts, creatorCounts];
    },
    [[], {}]
  );

  const [selectedCreator, setSelectedCreator] = React.useState<boolean>();

  React.useEffect(() => {
    if (creator && selectedCreator) {
      dispatch(setTab(PAGES.NFT_COLLECTION));
    }
  }, [creator, selectedCreator, dispatch]);

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
          mode={DisplayMode.Creator}
          listRef={listRef}
          nfts={creatorNfts}
          counters={creatorCounts}
          onClick={(asset: Nft) => {
            setCreator(asset.creator);
            setSelectedCreator(true);
          }}
        />
      )}
    </TabPanel>
  );
}
