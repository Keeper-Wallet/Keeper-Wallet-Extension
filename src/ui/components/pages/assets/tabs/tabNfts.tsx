import * as styles from 'ui/components/pages/styles/assets.styl';
import { Trans, useTranslation } from 'react-i18next';
import { SearchInput, TabPanel } from 'ui/components/ui';
import * as React from 'react';
import { useAppSelector } from 'ui/store';
import { sortAndFilterNfts, useUiState } from './helpers';
import cn from 'classnames';
import { NftList } from 'nfts/nftList';
import { DisplayMode } from 'nfts';
import { createNft, Nft } from 'nfts/utils';
import { getNftsLink } from 'ui/urls';
import { MAX_NFT_ITEMS } from '../../../../../constants';
import { useNavigate } from 'ui/router';

const PLACEHOLDERS = [...Array(4).keys()].map<Nft>(
  key =>
    ({
      id: `${key}`,
      creator: `${key}`,
    } as Nft)
);

export function TabNfts() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentAddress = useAppSelector(state => state.selectedAccount.address);
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const myNfts = useAppSelector(state => state.balances[currentAddress!]?.nfts);
  const nfts = useAppSelector(state => state.nfts);

  const [filters, setFilters] = useUiState('nftFilters');
  const [term, setTerm] = [
    filters?.term,
    (value: string) => setFilters({ ...filters, term: value }),
  ];
  const setCreator = (value: string | null | undefined) =>
    setFilters({ ...filters, creator: value });

  const nftConfig = useAppSelector(state => state.nftConfig);

  const getNftDetails = React.useCallback(
    nft =>
      createNft({
        asset: nft,
        info: nfts?.[nft.id],
        currentAddress,
        config: nftConfig,
      }),
    [nfts, currentAddress, nftConfig]
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (Object.prototype.hasOwnProperty.call(creatorCounts, creator!)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        creatorCounts[creator!] += 1;
        return [creatorNfts, creatorCounts];
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      creatorCounts[creator!] = 1;
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
          onInput={e => setTerm(e.currentTarget.value)}
          onClear={() => setTerm('')}
        />
      </div>
      {sortedNfts.length === 0 ? (
        <div className={cn('basic500 center margin-min-top', styles.tabInfo)}>
          {term ? (
            <>
              <div className="margin-min">
                {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
                  myNfts?.length! > MAX_NFT_ITEMS - 1 ? (
                    <Trans
                      i18nKey="assets.notFoundMaxNFTs"
                      values={{ count: MAX_NFT_ITEMS }}
                    />
                  ) : (
                    t('assets.notFoundNFTs')
                  )
                }
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
            navigate('/nft-collection');
          }}
          renderMore={() =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            myNfts?.length! > MAX_NFT_ITEMS - 1 && (
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
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  href={getNftsLink(networkCode!, currentAddress!)}
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
