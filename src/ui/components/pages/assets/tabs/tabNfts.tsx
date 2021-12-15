import * as styles from '../../styles/assets.styl';
import { colors, icontains } from '../helpers';
import { Trans } from 'react-i18next';
import { NftItem } from '../nftItem';
import { TabPanel } from '../../../ui';
import * as React from 'react';
import { SearchInput } from '../../Assets';
import { useAppSelector } from '../../../../store';
import { useNftFilter } from './helpers';
import { Asset } from '@waves/data-entities';
import { Tooltip } from '../../../ui/tooltip';

export function TabNfts({ onInfoClick, onSendClick }) {
  const address = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[address]?.nfts || []);

  const [term, setTerm] = useNftFilter('term');
  const [onlyMy, setOnlyMy] = useNftFilter('onlyMy');

  const nftEntries = Object.entries<Asset[]>(
    myNfts
      .filter(
        nft =>
          (!onlyMy || nft.issuer === address) &&
          (!term || nft.id === term || icontains(nft.displayName, term))
      )
      .sort((a, b) => (a.displayName ?? '').localeCompare(b.displayName ?? ''))
      .reduce(
        (result, item) => ({
          ...result,
          [item.issuer]: [...(result[item.issuer] || []), item],
        }),
        {}
      )
  );

  return (
    <TabPanel className={styles.assetsPanel}>
      <div className={styles.filterContainer}>
        <SearchInput
          value={term ?? ''}
          onInput={e => setTerm(e.target.value)}
          onClear={() => setTerm('')}
        />
        <Tooltip content={<Trans i18nKey="assets.onlyMyNfts" />}>
          <div className={styles.filterBtn} onClick={() => setOnlyMy(!onlyMy)}>
            <svg
              className={styles.filterBtnIcon}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                fill={onlyMy ? colors.submit400 : colors.basic500}
                fillOpacity=".01"
                d="M0 0h14v14H0z"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                fill={onlyMy ? colors.submit400 : colors.basic500}
              />
            </svg>
          </div>
        </Tooltip>
      </div>
      {nftEntries.length === 0 ? (
        <div className="basic500 center margin-min-top">
          {term || onlyMy ? (
            <Trans i18nKey="assets.notFoundNFTs" />
          ) : (
            <Trans i18nKey="assets.emptyNFTs" />
          )}
        </div>
      ) : (
        <div className={styles.nftList}>
          {nftEntries.map(([issuer, issuerNfts], index) => (
            <div
              key={issuer}
              className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
            >
              <div className="basic500 margin-min">
                <Trans i18nKey="assets.issuedBy" values={{ issuer }} />
              </div>
              {issuerNfts.map(nft => (
                <NftItem
                  key={nft.id}
                  asset={nft}
                  onInfoClick={onInfoClick}
                  onSendClick={onSendClick}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </TabPanel>
  );
}
