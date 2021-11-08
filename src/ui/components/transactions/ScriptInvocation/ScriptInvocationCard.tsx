import * as styles from './scriptInvocation.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Asset, Balance, PlateCollapsable, ShowScript } from '../../ui';
import { getAmounts, messageType } from './parseTx';
import { getMoney } from '../../../utils/converters';

const AmountTable = props => {
  return (
    <div className={props.className}>
      <table className={cn(styles.data, styles.dataTable)}>
        <tbody>
          {props.amounts.map((amount, index) => (
            <tr key={index} className={cn(styles.dataRow)}>
              <td className={styles.dataItem}>
                <Balance isShortFormat={true} balance={amount} />
              </td>
              <td className={styles.dataItemLast}>
                <Asset assetId={amount.asset.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface IProps {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

export class ScriptInvocationCard extends React.PureComponent<IProps> {
  render() {
    const className = cn(
      styles.scriptInvocationTransactionCard,
      this.props.className,
      {
        [styles.scriptInvocationCard_collapsed]: this.props.collapsed,
      }
    );

    const { message, assets, collapsed } = this.props;
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
    const functionName = (tx.call && tx.call.function) || 'Default';
    const amounts = getAmounts(tx).map(item => getMoney(item, assets));
    const hasPayment = !!(tx.payment && tx.payment.length);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.scriptInvocationTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              <Trans i18nKey="transactions.scriptInvocation" />
            </div>
            <h1 className="headline1">
              <Trans
                i18nKey={
                  hasPayment
                    ? 'transactions.paymentsCount'
                    : 'transactions.paymentsNone'
                }
                values={{ count: tx.payment.length || 0 }}
              />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              <Trans i18nKey="transactions.dApp" />
            </div>
            <div className={styles.txValue}>{tx.dApp}</div>
          </div>

          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              <Trans i18nKey="transactions.scriptInvocationFunction" />
            </div>
            <div className={styles.txValue}>{functionName}</div>
          </div>

          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              <Trans i18nKey="transactions.arguments" />
            </div>
            <div className={styles.txValue}>
              <ShowScript
                className={styles.dataScript}
                isData={true}
                noKey={true}
                data={(tx.call && tx.call.args) || []}
                optional={true}
                showNotify={true}
                hideScript={this.props.collapsed}
              />
            </div>
          </div>

          {hasPayment && (
            <div className={styles.txRow}>
              <div className="tx-title tag1 basic500">
                <Trans i18nKey="transactions.payments" />
              </div>
              <div className={styles.txValue}>
                <PlateCollapsable
                  className={styles.expandableList}
                  showExpand={!collapsed}
                >
                  <AmountTable amounts={amounts} />
                </PlateCollapsable>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
