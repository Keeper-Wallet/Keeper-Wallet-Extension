import cn from 'classnames';
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

export function TabNfts({ onItemClick }) {
  const address = useAppSelector(state => state.selectedAccount.address);
  const myNfts = useAppSelector(state => state.balances[address]?.nfts);

  const [nftTerm, setNftTerm] = useNftFilter('term');
  const [onlyMyNfts, setOnlyMyNfts] = useNftFilter('onlyMy');

  const nftEntries = Object.entries<Asset[]>(
    (myNfts || [])
      .filter(
        nft =>
          (!onlyMyNfts || nft.issuer === address) &&
          (!nftTerm ||
            nft.id === nftTerm ||
            icontains(nft.displayName, nftTerm))
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
    <TabPanel>
      <div className="flex grow margin1">
        <SearchInput
          value={nftTerm}
          onInput={e => setNftTerm(e.target.value)}
          onClear={() => setNftTerm('')}
        />
        <div
          className={cn('showTooltip', styles.filterBtn)}
          onClick={() => setOnlyMyNfts(!onlyMyNfts)}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill={onlyMyNfts ? colors.submit400 : colors.basic500}
              fillOpacity=".01"
              d="M0 0h14v14H0z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
              fill={onlyMyNfts ? colors.submit400 : colors.basic500}
            />
          </svg>
        </div>
        <div className={cn(styles.filterTooltip, 'tooltip')}>
          <Trans i18nKey="assets.onlyMyNfts" />
        </div>
      </div>
      {nftEntries.length === 0 ? (
        <div className="basic500 center margin-min-top">
          <Trans i18nKey="assets.emptyNFTs" />
        </div>
      ) : (
        nftEntries.map(([issuer, issuerNfts], index) => (
          <div
            key={issuer}
            className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
          >
            <div className="basic500 margin-min">
              <Trans i18nKey="assets.issuedBy" values={{ issuer }} />
            </div>
            {issuerNfts.map(nft => (
              <NftItem key={nft.id} asset={nft} onClick={onItemClick} />
            ))}
          </div>
        ))
      )}
    </TabPanel>
  );
}
