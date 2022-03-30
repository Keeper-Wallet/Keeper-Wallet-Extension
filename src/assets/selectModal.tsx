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
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredAndSortedItems = assets
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
    });

  const listRef = React.useRef<HTMLUListElement | null>(null);
  const listViewportRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const list = listRef.current;
    const listViewport = listViewportRef.current;

    if (!list || !listViewport) {
      return;
    }

    const viewportBcr = listViewport.getBoundingClientRect();

    const listItem = list.children[selectedIndex];

    if (!listItem) {
      return;
    }

    const listItemBcr = listItem.getBoundingClientRect();

    if (
      listItemBcr.top < viewportBcr.top ||
      listItemBcr.bottom > viewportBcr.bottom
    ) {
      listItem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedIndex]);

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
              setSelectedIndex(0);
            }}
            onKeyDown={event => {
              switch (event.key) {
                case 'ArrowDown':
                  if (filteredAndSortedItems.length !== 0) {
                    setSelectedIndex(
                      prevState =>
                        (prevState + 1) % filteredAndSortedItems.length
                    );
                  }
                  event.preventDefault();
                  break;
                case 'ArrowUp':
                  if (filteredAndSortedItems.length !== 0) {
                    setSelectedIndex(prevState => {
                      let newIndex = prevState - 1;

                      if (newIndex < 0) {
                        newIndex += filteredAndSortedItems.length;
                      }

                      return newIndex;
                    });
                  }
                  event.preventDefault();
                  break;
                case 'Enter':
                  if (filteredAndSortedItems.length !== 0) {
                    onSelect(filteredAndSortedItems[selectedIndex].asset.id);
                  }
                  event.preventDefault();
                  break;
              }
            }}
          />
        </div>

        <div className={styles.listViewport} ref={listViewportRef}>
          <ul ref={listRef}>
            {filteredAndSortedItems.map(({ asset, balance }, index) => {
              const logoSrc = getAssetLogo(network, asset.id);

              return (
                <li
                  key={asset.id}
                  className={cn(styles.listItem, {
                    [styles.listItem_selected]: index === selectedIndex,
                  })}
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

        <Button
          className="modal-close"
          type="button"
          view="transparent"
          onClick={onClose}
        />
      </div>
    </div>
  );
}
