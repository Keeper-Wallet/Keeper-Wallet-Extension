import * as styles from '../../styles/assets.styl';
import { Select, TabPanel } from '../../../ui';
import cn from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { colors, icontains } from '../helpers';
import { HistoryItem } from '../historyItem';
import * as React from 'react';
import { SearchInput } from '../../Assets';
import {
  ITransaction,
  WithId,
} from '@waves/waves-transactions/dist/transactions';
import { useAppSelector } from '../../../../store';
import { buildTxTypeOptions, MONTH, useTxHistoryFilter } from './helpers';
import { TRANSACTION_TYPE } from '@waves/ts-types';

export function TabTxHistory() {
  const { t } = useTranslation();
  const assets = useAppSelector(state => state.assets);
  const address = useAppSelector(state => state.selectedAccount.address);
  const aliases = useAppSelector(
    state => state.balances[address]?.aliases || []
  );
  const addressOrAlias = [address, ...aliases];
  const txHistory = useAppSelector(
    state => state.balances[address]?.txHistory || []
  );
  const thisYear = new Date().getFullYear();

  const [term, setTerm] = useTxHistoryFilter('term');
  const [type, setType] = useTxHistoryFilter('type');
  const [onlyIn, setOnlyIn] = useTxHistoryFilter('onlyIncoming');
  const [onlyOut, setOnlyOut] = useTxHistoryFilter('onlyOutgoing');

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

  const historyEntries = Object.entries<Array<ITransaction & WithId>>(
    txHistory
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
      .reduce((result, tx) => {
        const d = new Date(tx.timestamp);
        const [year, month, day] = [d.getFullYear(), d.getMonth(), d.getDate()];
        const date = `${(year !== thisYear && year) || ''} ${t(
          `date.${MONTH[month]}`
        )} ${day}`;
        return {
          ...result,
          [date]: [...(result[date] || []), tx],
        };
      }, {})
  );

  return (
    <TabPanel>
      <div className="flex grow margin1">
        <SearchInput
          value={term}
          onInput={e => setTerm(e.target.value)}
          onClear={() => setTerm('')}
        />
        <Select
          className={cn('showTooltip', styles.filterTxSelect)}
          selected={type as string}
          onSelectItem={(id, value) => setType(value)}
          selectList={buildTxTypeOptions(t)}
        />
        <div className={cn(styles.filterTxTooltip, 'tooltip')}>
          <Trans i18nKey="historyFilters.type" />
        </div>

        <div
          className={cn('showTooltip', styles.filterBtn)}
          onClick={() => setOnlyIn(!onlyIn)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 8.75L7 12.25M7 12.25L10.5 8.75M7 12.25V1.75"
              stroke={onlyIn ? colors.in : colors.basic500}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={cn(styles.filterIncomingTooltip, 'tooltip')}>
          <Trans i18nKey="historyFilters.incoming" />
        </div>

        <div
          className={cn('showTooltip', styles.filterBtn)}
          onClick={() => setOnlyOut(!onlyOut)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 5.25L7 1.75M7 1.75L10.5 5.25M7 1.75V12.25"
              stroke={onlyOut ? colors.out : colors.basic500}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={cn(styles.filterTooltip, 'tooltip')}>
          <Trans i18nKey="historyFilters.outgoing" />
        </div>
      </div>
      {!historyEntries.length ? (
        <div className="basic500 center margin-min-top">
          <Trans i18nKey="assets.emptyHistory" />
        </div>
      ) : (
        historyEntries.map(([date, txArr], index) => (
          <div
            key={date}
            className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
          >
            <div className="basic500 margin-min">{date}</div>
            {txArr.map(tx => (
              <HistoryItem key={tx.id} tx={tx} />
            ))}
          </div>
        ))
      )}
    </TabPanel>
  );
}
