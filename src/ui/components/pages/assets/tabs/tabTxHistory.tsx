import * as styles from '../../styles/assets.styl';
import { Select, TabPanel } from '../../../ui';
import { Trans, useTranslation } from 'react-i18next';
import { colors, getTxHistoryLink, icontains } from '../helpers';
import { HistoryItem } from '../historyItem';
import * as React from 'react';
import { SearchInput } from '../../Assets';
import {
  ITransaction,
  WithId,
} from '@waves/waves-transactions/dist/transactions';
import { useAppSelector } from '../../../../store';
import {
  buildTxTypeOptions,
  CARD_FULL_HEIGHT,
  FULL_GROUP_HEIGHT,
  MONTH,
  useTxHistoryFilter,
} from './helpers';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { MAX_TX_HISTORY_ITEMS } from '../../../../../controllers/CurrentAccountController';
import { Tooltip } from '../../../ui/tooltip';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import cn from 'classnames';

const Row = ({ data, index, style }) => {
  const { historyWithGroups, hasMore, hasFilters, historyLink } = data;
  const historyOrGroup = historyWithGroups[index];

  return (
    <div style={style}>
      {'groupName' in historyOrGroup ? (
        <div className={cn('basic500 margin-min', 'margin-min-top')}>
          {historyOrGroup.groupName}
        </div>
      ) : (
        <HistoryItem tx={historyOrGroup} />
      )}

      {index === historyWithGroups.length - 1 && hasMore && (
        <div className="basic500 center margin-main-top margin-main">
          <div className="margin-min">
            {hasFilters ? (
              <Trans
                i18nKey="assets.maxFiltersHistory"
                values={{ count: MAX_TX_HISTORY_ITEMS - 1 }}
              />
            ) : (
              <Trans
                i18nKey="assets.maxHistory"
                values={{ count: MAX_TX_HISTORY_ITEMS - 1 }}
              />
            )}
          </div>
          <a
            className="blue link"
            href={historyLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Trans i18nKey="assets.showExplorerHistory" />
          </a>
        </div>
      )}
    </div>
  );
};

export function TabTxHistory() {
  const { t } = useTranslation();
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );
  const assets = useAppSelector(state => state.assets);
  const showSuspiciousAssets = useAppSelector(
    state => !!state.uiState?.showSuspiciousAssets
  );
  const address = useAppSelector(state => state.selectedAccount.address);
  const aliases = useAppSelector(
    state => state.balances[address]?.aliases || []
  );
  const addressOrAlias = [address, ...aliases];
  const txHistory = useAppSelector(
    state =>
      state.balances[address]?.txHistory ??
      // placeholder
      [...Array(4).keys()].map(
        key =>
          ({
            id: `${key}`,
          } as ITransaction & WithId)
      )
  );

  const thisYear = new Date().getFullYear();

  const {
    term: [term, setTerm],
    type: [type, setType],
    onlyIncoming: [onlyIn, setOnlyIn],
    onlyOutgoing: [onlyOut, setOnlyOut],
    clearFilters,
  } = useTxHistoryFilter();
  const listRef = React.useRef<VariableSizeList>();

  React.useEffect(() => {
    listRef.current && listRef.current.resetAfterIndex(0);
  }, [txHistory]);

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
          (result, el) => result.concat(flat(el.stateChanges)),
          []
        )
      );

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

  const hasInvokeTransfers = (stateChanges: any): boolean =>
    flat(stateChanges).reduce(
      (hasTransfers, el) => hasTransfers || addressOrAlias.includes(el.address),
      false
    );

  const historyWithGroups = txHistory
    .slice(0, MAX_TX_HISTORY_ITEMS - 1)
    .filter((tx: any) => {
      const hasMassTransfers = (tx.transfers ?? []).reduce(
        (result: boolean, transfer: { amount: number; recipient: string }) =>
          result || addressOrAlias.includes(transfer.recipient),
        false
      );
      const hasInvokePayments = (tx.payment ?? []).length !== 0;
      const hasInvokePaymentsAsset = (tx.payment ?? []).reduce(
        (hasPayments, el) =>
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
          (tx.type === TRANSACTION_TYPE.MASS_TRANSFER && !hasMassTransfers) ||
          (tx.type === TRANSACTION_TYPE.INVOKE_SCRIPT && hasInvokePayments))
      );
    })
    .reduce<Array<(ITransaction & WithId) | { groupName: string }>>(
      (result, tx, index, prevItems) => {
        const d = new Date(tx.timestamp);
        const [Y, M, D] = [d.getFullYear(), d.getMonth(), d.getDate()];

        if (
          tx.timestamp &&
          (!prevItems[index - 1] ||
            new Date(prevItems[index - 1].timestamp).toDateString() !==
              d.toDateString())
        ) {
          result.push({
            groupName: `${(Y !== thisYear && Y) || ''} ${t(
              `date.${MONTH[M]}`
            )} ${D}`.trim(),
          });
        }
        result.push(tx);
        return result;
      },
      []
    );

  return (
    <TabPanel className={styles.assetsPanel}>
      <div className={styles.filterContainer}>
        <SearchInput
          value={term ?? ''}
          onInput={e => {
            listRef.current && listRef.current.resetAfterIndex(0);
            setTerm(e.target.value);
          }}
          onClear={() => {
            listRef.current && listRef.current.resetAfterIndex(0);
            setTerm('');
          }}
        />

        <Tooltip content={<Trans i18nKey="historyFilters.type" />}>
          {({ ref, ...restProps }) => (
            <Select
              className={styles.filterTxSelect}
              selected={type}
              onSelectItem={(id, value) => {
                listRef.current && listRef.current.resetAfterIndex(0);
                setType(value);
              }}
              selectList={buildTxTypeOptions(t)}
              forwardRef={ref}
              {...restProps}
            />
          )}
        </Tooltip>

        <Tooltip content={<Trans i18nKey="historyFilters.incoming" />}>
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
                fill="none"
              >
                <path
                  d="M12.7653 4.78956C12.7556 4.16098 12.2574 3.65792 11.6454 3.6589C11.0335 3.65988 10.5337 4.16454 10.5221 4.79315L11.0013 9.65964L2.12261 0.53773C1.68523 0.0883596 0.974976 0.0894951 0.536225 0.540267C0.0974734 0.991038 0.0963682 1.72075 0.533755 2.17012L9.41241 11.292L4.67569 10.7998C4.06385 10.8117 3.57265 11.3252 3.5717 11.9538C3.57074 12.5825 4.06039 13.0944 4.6722 13.1044L12.1169 13.5923C12.7363 13.5912 13.2392 13.0746 13.2402 12.4382L12.7653 4.78956Z"
                  fill={onlyIn ? colors.in : colors.basic500}
                />
              </svg>
            </div>
          )}
        </Tooltip>

        <Tooltip content={<Trans i18nKey="historyFilters.outgoing" />}>
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
                fill="none"
              >
                <path
                  d="M12.7653 9.21044C12.7556 9.83902 12.2574 10.3421 11.6454 10.3411C11.0335 10.3401 10.5337 9.83546 10.5221 9.20685L11.0013 4.34036L2.12261 13.4623C1.68523 13.9116 0.974976 13.9105 0.536225 13.4597C0.0974734 13.009 0.0963682 12.2793 0.533755 11.8299L9.41241 2.70797L4.67569 3.20022C4.06385 3.18832 3.57265 2.67485 3.5717 2.04616C3.57074 1.41747 4.06039 0.905561 4.6722 0.895614L12.1169 0.407693C12.7363 0.40878 13.2392 0.925431 13.2402 1.56179L12.7653 9.21044Z"
                  fill={onlyOut ? colors.out : colors.basic500}
                />
              </svg>
            </div>
          )}
        </Tooltip>
      </div>

      {!historyWithGroups.length ? (
        <div className="basic500 center margin-min-top">
          {term || type || onlyIn || onlyOut ? (
            <>
              <div className="margin-min">
                <Trans i18nKey="assets.notFoundHistory" />
              </div>
              <p className="blue link" onClick={() => clearFilters()}>
                <Trans i18nKey="assets.resetFilters" />
              </p>
            </>
          ) : (
            <Trans i18nKey="assets.emptyHistory" />
          )}
        </div>
      ) : (
        <div className={styles.historyList}>
          <AutoSizer>
            {({ height, width }) => {
              const hasMore = txHistory.length === MAX_TX_HISTORY_ITEMS;
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
                      historyLink: getTxHistoryLink(networkCode, address),
                    }}
                    itemKey={(index, { historyWithGroups }) =>
                      'groupName' in historyWithGroups[index]
                        ? `g:${historyWithGroups[index].groupName}`
                        : `a:${historyWithGroups[index].id}`
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
