import { TRANSACTION_TYPE, type TransactionFromNode } from '@waves/ts-types';
import clsx from 'clsx';
import { usePopupSelector } from 'popup/store/react';
import { type CSSProperties, useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList } from 'react-window';
import invariant from 'tiny-invariant';
import { icontains } from 'ui/components/pages/assets/helpers';
import { HistoryItem } from 'ui/components/pages/assets/historyItem';
import * as styles from 'ui/components/pages/styles/assets.styl';
import { SearchInput, Select, TabPanel } from 'ui/components/ui';
import { Tooltip } from 'ui/components/ui/tooltip';
import { getTxHistoryLink } from 'ui/urls';

import { MAX_TX_HISTORY_ITEMS } from '../../../../../constants';
import {
  buildTxTypeOptions,
  CARD_FULL_HEIGHT,
  FULL_GROUP_HEIGHT,
  useUiState,
} from './helpers';

const Row = ({
  data,
  index,
  style,
}: {
  data: {
    historyWithGroups: Array<TransactionFromNode | { groupName: string }>;
    hasMore: boolean | undefined;
    hasFilters: string | number | boolean | undefined;
    historyLink: string;
  };
  index: number;
  style: CSSProperties;
}) => {
  const { t } = useTranslation();
  const { historyWithGroups, hasMore, hasFilters, historyLink } = data;
  const historyOrGroup = historyWithGroups[index];

  return (
    <div style={style}>
      {'groupName' in historyOrGroup ? (
        <div className={clsx('basic500 margin-min', 'margin-min-top')}>
          {historyOrGroup.groupName}
        </div>
      ) : (
        <HistoryItem tx={historyOrGroup} />
      )}

      {index === historyWithGroups.length - 1 && hasMore && (
        <div className="basic500 center margin-main-top margin-main">
          <div className="margin-min">
            {hasFilters
              ? t('assets.maxFiltersHistory', {
                  count: MAX_TX_HISTORY_ITEMS - 1,
                })
              : t('assets.maxHistory', { count: MAX_TX_HISTORY_ITEMS - 1 })}
          </div>
          <a
            className="blue link"
            href={historyLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('assets.showExplorerHistory')}
          </a>
        </div>
      )}
    </div>
  );
};

const PLACEHOLDERS = [...Array(4).keys()].map<TransactionFromNode>(
  key =>
    ({
      id: `${key}`,
    } as TransactionFromNode)
);

export function TabTxHistory() {
  const { t, i18n } = useTranslation();
  const networkCode = usePopupSelector(
    state => state.selectedAccount?.networkCode
  );
  const assets = usePopupSelector(state => state.assets);
  const showSuspiciousAssets = usePopupSelector(
    state => !!state.uiState?.showSuspiciousAssets
  );
  const address = usePopupSelector(state => state.selectedAccount?.address);
  const aliases = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state => state.balances[address!]?.aliases || []
  );
  const addressOrAlias = [address, ...aliases];
  const txHistory = usePopupSelector(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state => state.balances[address!]?.txHistory
  );

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth();
  const thisDate = new Date().getDate();

  const [filters, setFilters] = useUiState('txHistoryFilters');
  const [term, setTerm] = [
    filters?.term,
    (value: string) => setFilters({ ...filters, term: value }),
  ];
  const [type, setType] = [
    filters?.type,
    (value: number | undefined) => setFilters({ ...filters, type: value }),
  ];
  const [onlyIn, setOnlyIn] = [
    filters?.onlyIncoming,
    (value: boolean) => setFilters({ ...filters, onlyIncoming: value }),
  ];
  const [onlyOut, setOnlyOut] = [
    filters?.onlyOutgoing,
    (value: boolean) => setFilters({ ...filters, onlyOutgoing: value }),
  ];

  const listRef = useRef<VariableSizeList | null>(null);

  useEffect(() => {
    listRef.current && listRef.current.resetAfterIndex(0);
  }, [txHistory]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flat = (stateChanges: any): any[] =>
    (stateChanges?.transfers ?? [])
      .concat(stateChanges?.issues ?? [])
      .concat(stateChanges?.reissues ?? [])
      .concat(stateChanges?.burns ?? [])
      .concat(stateChanges?.sponsorFees ?? [])
      .concat(stateChanges?.leases ?? [])
      .concat(stateChanges?.leaseCancels ?? [])
      .concat(stateChanges?.invokes ?? [])
      .concat(
        (stateChanges?.invokes ?? []).reduce(
          (result: unknown[], el: { stateChanges: unknown[] }) =>
            result.concat(flat(el.stateChanges)),
          []
        )
      );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasInvokeStateChanges = (stateChanges: any): boolean =>
    flat(stateChanges || {}).reduce(
      (hasItems, el) =>
        hasItems ||
        [el.asset, el.address, el.assetId, el.leaseId, el.dApp].includes(
          term
        ) ||
        [
          el.address,
          el.name,
          assets[el.assetId]?.displayName,
          el.call?.function || 'default',
        ].reduce((result, name) => result || icontains(name, term), false),
      false
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasInvokeTransfers = (stateChanges: any): boolean =>
    flat(stateChanges).reduce(
      (hasTransfers, el) => hasTransfers || addressOrAlias.includes(el.address),
      false
    );

  const historyWithGroups = txHistory
    ? txHistory
        .slice(0, MAX_TX_HISTORY_ITEMS - 1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((tx: any) => {
          const hasMassTransfers = (tx.transfers ?? []).reduce(
            (
              result: boolean,
              transfer: { amount: number; recipient: string }
            ) => result || addressOrAlias.includes(transfer.recipient),
            false
          );
          const hasInvokePayments = (tx.payment ?? []).length !== 0;
          const hasInvokePaymentsAsset = (tx.payment ?? []).reduce(
            (hasPayments: unknown, el: { assetId: string }) =>
              hasPayments ||
              el.assetId === term ||
              icontains(assets[el.assetId]?.displayName ?? '', term),
            false
          );

          return (
            (!showSuspiciousAssets || !assets[tx.assetId]?.isSuspicious) &&
            (!term ||
              tx.id === term ||
              tx.assetId === term ||
              icontains(assets[tx.assetId]?.displayName ?? '', term) ||
              tx.sender === term ||
              tx.recipient === term ||
              icontains(tx.alias ?? '', term) ||
              tx.dApp === term ||
              hasInvokePaymentsAsset ||
              icontains(tx.call?.function ?? '', term) ||
              hasInvokeStateChanges(tx.stateChanges)) &&
            (!type || tx.type === type) &&
            (!onlyIn ||
              (!addressOrAlias.includes(tx.sender) &&
                (addressOrAlias.includes(tx.recipient) || hasMassTransfers)) ||
              hasInvokeTransfers(tx.stateChanges)) &&
            (!onlyOut ||
              (tx.type === TRANSACTION_TYPE.TRANSFER &&
                addressOrAlias.includes(tx.sender)) ||
              (tx.type === TRANSACTION_TYPE.MASS_TRANSFER &&
                !hasMassTransfers) ||
              (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT && hasInvokePayments))
          );
        })
        .reduce<Array<TransactionFromNode | { groupName: string }>>(
          (result, tx, index, prevItems) => {
            const d = new Date(tx.timestamp);

            if (
              tx.timestamp &&
              (!prevItems[index - 1] ||
                new Date(prevItems[index - 1].timestamp).toDateString() !==
                  d.toDateString())
            ) {
              const [Y, M, D] = [d.getFullYear(), d.getMonth(), d.getDate()];
              const options: Intl.DateTimeFormatOptions = {
                month: 'short',
                day: '2-digit',
              };
              let note = '';

              if (Y !== thisYear) {
                options.year = 'numeric';
              } else if (M === thisMonth && D === thisDate) {
                note = t('date.today');
              }

              const txDate = new Intl.DateTimeFormat(
                i18n.language,
                options
              ).format(d);
              result.push({ groupName: note ? `${txDate} ${note}` : txDate });
            }
            result.push(tx);
            return result;
          },
          []
        )
    : PLACEHOLDERS;

  return (
    <TabPanel className={styles.assetsPanel}>
      <div className={styles.filterContainer}>
        <SearchInput
          value={term ?? ''}
          onInput={e => {
            listRef.current && listRef.current.resetAfterIndex(0);
            setTerm(e.currentTarget.value);
          }}
          onClear={() => {
            listRef.current && listRef.current.resetAfterIndex(0);
            setTerm('');
          }}
        />

        <Tooltip content={t('historyFilters.type')}>
          {({ ref, ...restProps }) => (
            <Select
              className={styles.filterTxSelect}
              forwardRef={ref}
              selected={type}
              selectList={buildTxTypeOptions(t)}
              theme="underlined"
              onSelectItem={(_id, value) => {
                listRef.current && listRef.current.resetAfterIndex(0);
                setType(value);
              }}
              {...restProps}
            />
          )}
        </Tooltip>

        <Tooltip content={t('historyFilters.incoming')}>
          {props => (
            <div
              className={styles.filterBtn}
              onClick={() => {
                listRef.current && listRef.current.resetAfterIndex(0);
                setOnlyIn(!onlyIn);
              }}
              {...props}
            >
              <svg
                className={styles.filterBtnIcon}
                width="12"
                height="12"
                viewBox="0 0 14 14"
              >
                <path
                  d="M1.2347 4.78956C1.24438 4.16098 1.74264 3.65792 2.35456 3.6589C2.96648 3.65988 3.46627 4.16454 3.47785 4.79315L2.99873 9.65964L11.8774 0.53773C12.3148 0.0883591 13.025 0.0894952 13.4638 0.540267C13.9025 0.991039 13.9036 1.72075 13.4662 2.17012L4.58759 11.292L9.32431 10.7998C9.93615 10.8117 10.4274 11.3252 10.4283 11.9538C10.4293 12.5825 9.93961 13.0944 9.3278 13.1044L1.88311 13.5923C1.26372 13.5912 0.760846 13.0746 0.759789 12.4382L1.2347 4.78956Z"
                  fill={onlyIn ? '#81C926' : 'var(--color-basic500)'}
                />
              </svg>
            </div>
          )}
        </Tooltip>

        <Tooltip content={t('historyFilters.outgoing')}>
          {props => (
            <div
              className={styles.filterBtn}
              onClick={() => {
                listRef.current && listRef.current.resetAfterIndex(0);
                setOnlyOut(!onlyOut);
              }}
              {...props}
            >
              <svg
                className={styles.filterBtnIcon}
                width="12"
                height="12"
                viewBox="0 0 14 14"
              >
                <path
                  d="M12.7653 9.21044C12.7556 9.83902 12.2574 10.3421 11.6454 10.3411C11.0335 10.3401 10.5337 9.83546 10.5221 9.20685L11.0013 4.34036L2.12261 13.4623C1.68523 13.9116 0.974976 13.9105 0.536225 13.4597C0.0974734 13.009 0.0963682 12.2793 0.533755 11.8299L9.41241 2.70797L4.67569 3.20022C4.06385 3.18832 3.57265 2.67485 3.5717 2.04616C3.57074 1.41747 4.06039 0.905561 4.6722 0.895614L12.1169 0.407693C12.7363 0.40878 13.2392 0.925431 13.2402 1.56179L12.7653 9.21044Z"
                  fill={onlyOut ? '#FFAF00' : 'var(--color-basic500)'}
                />
              </svg>
            </div>
          )}
        </Tooltip>
      </div>

      {!historyWithGroups.length ? (
        <div className={clsx('basic500 center margin-min-top', styles.tabInfo)}>
          {term || type || onlyIn || onlyOut ? (
            <>
              <div className="margin-min">
                <Trans
                  t={t}
                  i18nKey="assets.notFoundHistory"
                  values={{ count: MAX_TX_HISTORY_ITEMS - 1 }}
                />
              </div>
              <p className="blue link" onClick={() => setFilters(null)}>
                {t('assets.resetFilters')}
              </p>
            </>
          ) : (
            t('assets.emptyHistory')
          )}
        </div>
      ) : (
        <div className={styles.historyList}>
          <AutoSizer>
            {({ height, width }) => {
              invariant(width != null);
              invariant(height != null);

              const hasMore =
                txHistory && txHistory.length === MAX_TX_HISTORY_ITEMS;
              return (
                <>
                  <VariableSizeList
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={historyWithGroups.length}
                    itemSize={index =>
                      'groupName' in historyWithGroups[index]
                        ? FULL_GROUP_HEIGHT
                        : CARD_FULL_HEIGHT *
                          (1 +
                            Number(
                              index === historyWithGroups.length - 1 && hasMore
                            ))
                    }
                    itemData={{
                      historyWithGroups,
                      hasMore,
                      hasFilters: term || type || onlyIn || onlyOut,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      historyLink: getTxHistoryLink(networkCode!, address!),
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    itemKey={(index, { historyWithGroups }) =>
                      'groupName' in historyWithGroups[index]
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          `g:${(historyWithGroups[index] as any).groupName}`
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          `a:${(historyWithGroups[index] as any).id}`
                    }
                  >
                    {Row}
                  </VariableSizeList>
                </>
              );
            }}
          </AutoSizer>
        </div>
      )}
    </TabPanel>
  );
}
