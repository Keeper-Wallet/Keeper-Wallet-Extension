import cn from 'classnames';
import * as styles from '../../styles/assets.styl';
import { colors, icontains } from '../helpers';
import { Trans } from 'react-i18next';
import { AssetItem } from '../assetItem';
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import * as React from 'react';
import { SearchInput } from '../../Assets';
import { useAppSelector } from '../../../../store';
import { TabPanel } from '../../../ui';
import { useAssetFilter } from './helpers';

export function TabAssets({ onItemClick }) {
  const assets = useAppSelector(state => state.assets);
  const address = useAppSelector(state => state.selectedAccount.address);
  const myAssets = useAppSelector(
    state => state.balances[address]?.assets || {}
  );

  const [assetTerm, setAssetTerm] = useAssetFilter('term');
  const [onlyMyAssets, setOnlyMyAssets] = useAssetFilter('onlyMy');
  const [onlyFavorites, setOnlyFavorites] = useAssetFilter('onlyFavorites');

  const assetEntries = Object.entries<{ balance: string }>(myAssets)
    .filter(
      ([assetId]) =>
        (!onlyFavorites || assets[assetId]?.isFavorite === onlyFavorites) &&
        (!onlyMyAssets || (assets && assets[assetId]?.issuer === address)) &&
        (!assetTerm ||
          assetId === assetTerm ||
          icontains(assets[assetId]?.displayName, assetTerm))
    )

    .sort(
      ([a], [b]) =>
        assets[a] &&
        assets[b] &&
        (!!assets[a].isFavorite < !!assets[b].isFavorite
          ? 1
          : !!assets[a].isFavorite > !!assets[b].isFavorite
          ? -1
          : (assets[a].displayName ?? '').localeCompare(
              assets[b].displayName ?? ''
            ))
    );
  return (
    <TabPanel>
      <div className="flex margin1">
        <SearchInput
          value={assetTerm}
          onInput={e => setAssetTerm(e.target.value)}
          onClear={() => setAssetTerm('')}
        />
        <div
          className={cn('showTooltip', styles.filterBtn)}
          onClick={() => setOnlyFavorites(!onlyFavorites)}
        >
          <svg
            className={styles.favIcon}
            fill={onlyFavorites ? colors.submit400 : 'none'}
            stroke={onlyFavorites ? colors.submit400 : colors.basic500}
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path d="M10.6472 6.66036L10.7648 6.9373L11.0645 6.96315L15.2801 7.32666L12.0848 10.0999L11.8574 10.2972L11.9254 10.5904L12.8808 14.7108L9.25837 12.5244L9 12.3685L8.74163 12.5244L5.12113 14.7096L6.08193 10.5911L6.15049 10.2972L5.92239 10.0996L2.72308 7.32803L6.93477 6.97071L7.2352 6.94522L7.35286 6.66761L9.00035 2.78048L10.6472 6.66036Z" />
          </svg>
        </div>
        <div className={cn(styles.filterTooltip, 'tooltip')}>
          <Trans i18nKey="assets.onlyFavorites" />
        </div>
        <div
          className={cn('showTooltip', styles.filterBtn)}
          onClick={() => setOnlyMyAssets(!onlyMyAssets)}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill={onlyMyAssets ? colors.submit400 : colors.basic500}
              fillOpacity=".01"
              d="M0 0h14v14H0z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
              fill={onlyMyAssets ? colors.submit400 : colors.basic500}
            />
          </svg>
        </div>
        <div className={cn(styles.filterTooltip, 'tooltip')}>
          <Trans i18nKey="assets.onlyMyAssets" />
        </div>
      </div>

      {assetEntries.length === 0 ? (
        <div className="basic500 center margin-min-top">
          <Trans i18nKey="assets.emptyAssets" />
        </div>
      ) : (
        assetEntries.map(([assetId, { balance }]) => (
          <AssetItem
            key={assetId}
            balance={
              assets[assetId] &&
              new Money(new BigNumber(balance), new Asset(assets[assetId]))
            }
            assetId={assetId}
            onClick={onItemClick}
          />
        ))
      )}
    </TabPanel>
  );
}
