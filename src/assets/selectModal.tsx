import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import cn from 'classnames';
import ColorHash from 'color-hash';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { Input } from 'ui/components/ui/input/index';
import { BalanceAssets } from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import { getAssetLogo } from './utils';
import * as styles from './selectModal.module.css';

interface Props {
  assetBalances: BalanceAssets;
  assets: AssetDetail[];
  network: string;
  onClose: () => void;
  onSelect: (assetId: string) => void;
}

export function AssetSelectModal({
  assetBalances,
  assets,
  network,
  onClose,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');

  return (
    <div className={cn('modal', 'cover', styles.root)}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Trans i18nKey="assetSelectModal.title" />
          </h2>

          <Input
            autoFocus
            placeholder={t('assetSelectModal.searchPlaceholder')}
            value={query}
            onChange={event => {
              setQuery(event.currentTarget.value);
            }}
          />
        </div>

        <div className={styles.list}>
          <ul>
            {assets
              .filter(
                asset =>
                  asset.id === query ||
                  asset.name.toLowerCase().includes(query.toLowerCase()) ||
                  (!!asset.ticker &&
                    asset.ticker.toLowerCase().includes(query.toLowerCase()))
              )
              .map(asset => {
                const balance = new Money(
                  new BigNumber(assetBalances[asset.id]?.balance ?? 0),
                  new Asset(asset)
                );

                return {
                  asset,
                  balance,
                };
              })
              .sort((a, b) => {
                const aIsZero = a.balance.getCoins().eq(0);
                const bIsZero = b.balance.getCoins().eq(0);

                if (aIsZero === bIsZero) {
                  return 0;
                }

                if (aIsZero) {
                  return 1;
                }

                return -1;
              })
              .map(({ asset, balance }) => {
                const logoSrc = getAssetLogo(network, asset.id);

                return (
                  <li
                    key={asset.id}
                    className={styles.listItem}
                    onClick={() => {
                      onSelect(asset.id);
                    }}
                  >
                    <div className={styles.logo}>
                      {logoSrc ? (
                        <img className={styles.logoImg} src={logoSrc} alt="" />
                      ) : (
                        <div
                          className={styles.logoPlaceholder}
                          style={{
                            backgroundColor: new ColorHash().hex(asset.id),
                          }}
                        >
                          {asset.displayName[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div
                      className={styles.listItemName}
                      title={asset.displayName}
                    >
                      {asset.displayName}
                    </div>

                    <div className={styles.listItemBalance}>
                      {balance.toFormat()}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        <Button className="modal-close" onClick={onClose} type="transparent" />
      </div>
    </div>
  );
}
