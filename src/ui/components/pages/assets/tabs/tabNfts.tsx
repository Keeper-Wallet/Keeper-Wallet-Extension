import styles from 'ui/components/pages/styles/assets.styl';
import { Trans, useTranslation } from 'react-i18next';
import { SearchInput, TabPanel } from 'ui/components/ui';
import * as React from 'react';
import { useAppSelector } from 'ui/store';
import { sortAndFilterNfts, useUiState } from './helpers';
import cn from 'classnames';
import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import { PAGES } from 'ui/pageConfig';
import { createNft, Nft } from 'nfts/utils';
import { getNftsLink } from 'ui/urls';
import { MAX_NFT_ITEMS } from 'controllers/CurrentAccountController';

const PLACEHOLDERS = [...Array(4).keys()].map<Nft>(
  key =>
    ({
      id: `${key}`,
      creator: `${key}`,
    } as Nft)
);

export function TabNfts({ nextTab }: { nextTab: (tab: string) => void }) {
  const { t } = useTranslation();

  const address = useAppSelector(state => state.selectedAccount.address);
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );
  const myNfts = useAppSelector(state => state.balances[address]?.nfts);
  const nfts = useAppSelector(state => state.nfts);

  const [filters, setFilters] = useUiState('nftFilters');
  const [term, setTerm] = [
    filters?.term,
    value => setFilters({ ...filters, term: value }),
  ];
  const setCreator = value => setFilters({ ...filters, creator: value });

  const getNftDetails = React.useCallback(
    nft => createNft(nft, nfts[nft.id], address),
    [nfts, address]
  );

  const sortedNfts =
    myNfts && nfts
      ? sortAndFilterNfts(myNfts.map(getNftDetails), { term })
      : PLACEHOLDERS;

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
          onInput={e => setTerm(e.target.value)}
          onClear={() => setTerm('')}
        />
      </div>
      {sortedNfts.length === 0 ? (
        <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
          {term ? (
            <>
              <div className="margin-min">
                {myNfts?.length > MAX_NFT_ITEMS - 1 ? (
                  <Trans
                    i18nKey="assets.notFoundMaxNFTs"
                    values={{ count: MAX_NFT_ITEMS }}
                  />
                ) : (
                  t('assets.notFoundNFTs')
                )}
              </div>
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
          nfts={creatorNfts}
          counters={creatorCounts}
          onClick={(asset: Nft) => {
            setCreator(asset.creator);
            nextTab(PAGES.NFT_COLLECTION);
          }}
          renderMore={() =>
            myNfts?.length > MAX_NFT_ITEMS - 1 && (
              <div className={cn(styles.nftListMore, 'basic500')}>
                <div className="margin-min">
                  {term ? (
                    <Trans
                      t={t}
                      i18nKey="assets.maxFiltersNFTs"
                      values={{ count: MAX_NFT_ITEMS }}
                    />
                  ) : (
                    t('assets.maxNFTs', {
                      count: MAX_NFT_ITEMS,
                    })
                  )}
                </div>
                <a
                  className="blue link"
                  href={getNftsLink(networkCode, address)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t('assets.showExplorerNFTs')}
                </a>
              </div>
            )
          }
        />
      )}
    </TabPanel>
  );
}
