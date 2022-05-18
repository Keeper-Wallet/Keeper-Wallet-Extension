import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import cn from 'classnames';
import ColorHash from 'color-hash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { Input } from 'ui/components/ui/input/index';
import { Tooltip } from 'ui/components/ui/tooltip';
import { BalanceAssets } from 'ui/reducers/updateState';
import { AssetDetail } from 'ui/services/Background';
import { getAssetLogo } from './utils';
import * as styles from './selectModal.module.css';

export interface AssetSelectModalOption extends AssetDetail {
  disabled?: boolean;
  disabledTooltip?: string;
}

interface Props {
  assetBalances: BalanceAssets;
  assets: AssetSelectModalOption[];
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

  const filteredAndSortedItems = React.useMemo(
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

  React.useEffect(() => {
    setSelectedIndex(
      filteredAndSortedItems.findIndex(item => !item.asset.disabled)
    );
  }, [filteredAndSortedItems]);

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
            {filteredAndSortedItems.map(({ asset, balance }, index) => {
              const logoSrc = getAssetLogo(network, asset.id);

              const listItemEl = (
                <li
                  className={cn(styles.listItem, {
                    [styles.listItem_selected]: index === selectedIndex,
                    [styles.listItem_disabled]: asset.disabled,
                  })}
                  onClick={
                    asset.disabled
                      ? undefined
                      : () => {
                          onSelect(asset.id);
                        }
                  }
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

                  <div className={styles.listItemBalance}>
                    {balance.toFormat()}
                  </div>
                </li>
              );

              return asset.disabled && asset.disabledTooltip ? (
                <Tooltip
                  key={asset.id}
                  className={styles.listItemTooltipContent}
                  content={asset.disabledTooltip}
                >
                  {props => React.cloneElement(listItemEl, props)}
                </Tooltip>
              ) : (
                React.cloneElement(listItemEl, { key: asset.id })
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
