import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { type BalanceAssets } from 'balances/types';
import clsx from 'clsx';
import ColorHash from 'color-hash';
import { type NetworkName } from 'networks/types';
import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { Input } from 'ui/components/ui/input';
import { Tooltip } from 'ui/components/ui/tooltip';

import * as styles from './selectModal.module.css';
import { type AssetDetail } from './types';
import { useAssetLogo } from './utils';

export interface AssetSelectModalOption extends AssetDetail {
  disabled?: boolean;
  disabledTooltip?: string;
}

interface ItemProps {
  className?: string;
  asset: AssetSelectModalOption;
  network: NetworkName;
  balance: Money;
  onSelect: (assetId: string) => void;
}

function AssetSelectItem({
  className,
  network,
  asset,
  balance,
  onSelect,
}: ItemProps) {
  const logoSrc = useAssetLogo(network, asset.id);

  const listItemEl = (
    <li
      className={className}
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

      <div className={styles.listItemName}>{asset.displayName}</div>
      <div className={styles.listItemBalance}>{balance.toFormat()}</div>
    </li>
  );

  return asset.disabled && asset.disabledTooltip ? (
    <Tooltip
      key={asset.id}
      className={styles.listItemTooltipContent}
      content={asset.disabledTooltip}
    >
      {props => cloneElement(listItemEl, props)}
    </Tooltip>
  ) : (
    cloneElement(listItemEl, { key: asset.id })
  );
}

interface Props {
  assetBalances: BalanceAssets;
  assets: AssetSelectModalOption[];
  network: NetworkName;
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
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredAndSortedItems = useMemo(
    () =>
      assets
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
            const aName = a.asset.ticker || a.asset.name;
            const bName = b.asset.ticker || b.asset.name;

            return aName.localeCompare(bName);
          }

          if (aIsZero) {
            return 1;
          }

          return -1;
        }),
    [assetBalances, assets, query]
  );

  useEffect(() => {
    setSelectedIndex(
      filteredAndSortedItems.findIndex(item => !item.asset.disabled)
    );
  }, [filteredAndSortedItems]);

  const listRef = useRef<HTMLUListElement | null>(null);
  const listViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
    <div className={clsx('modal', 'cover', styles.root)}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('assetSelectModal.title')}</h2>

          <Input
            autoFocus
            placeholder={t('assetSelectModal.searchPlaceholder')}
            value={query}
            onChange={event => {
              setQuery(event.currentTarget.value);
            }}
            onKeyDown={event => {
              switch (event.key) {
                case 'ArrowDown':
                  if (filteredAndSortedItems.length !== 0) {
                    setSelectedIndex(prevState => {
                      if (
                        filteredAndSortedItems.every(
                          item => item.asset.disabled
                        )
                      ) {
                        return -1;
                      }

                      let newIndex = prevState;

                      do {
                        newIndex++;

                        if (newIndex > filteredAndSortedItems.length - 1) {
                          newIndex -= filteredAndSortedItems.length;
                        }
                      } while (filteredAndSortedItems[newIndex].asset.disabled);

                      return newIndex;
                    });
                  }
                  event.preventDefault();
                  break;
                case 'ArrowUp':
                  if (filteredAndSortedItems.length !== 0) {
                    setSelectedIndex(prevState => {
                      if (
                        filteredAndSortedItems.every(
                          item => item.asset.disabled
                        )
                      ) {
                        return -1;
                      }

                      let newIndex = prevState;

                      do {
                        newIndex--;

                        if (newIndex < 0) {
                          newIndex += filteredAndSortedItems.length;
                        }
                      } while (filteredAndSortedItems[newIndex].asset.disabled);

                      return newIndex;
                    });
                  }
                  event.preventDefault();
                  break;
                case 'Enter':
                  if (
                    selectedIndex !== -1 &&
                    filteredAndSortedItems.length !== 0 &&
                    !filteredAndSortedItems[selectedIndex].asset.disabled
                  ) {
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
            {filteredAndSortedItems.map(({ asset, balance }, index) => (
              <AssetSelectItem
                className={clsx(styles.listItem, {
                  [styles.listItemSelected]: index === selectedIndex,
                  [styles.listItemUnavailable]: asset.disabled,
                })}
                network={network}
                asset={asset}
                balance={balance}
                onSelect={onSelect}
                key={asset.id}
              />
            ))}
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
