import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { getMoney } from '../../../utils/converters';
import { Balance, ShowScript } from '../../ui';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './issue.styl';
import { getAmount, messageType } from './parseTx';

class IssueCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.issueTransactionCard, this.props.className, {
      [styles.issueCardCollapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
    const amount = getMoney(getAmount(tx), assets);
    const decimals = tx.precision || tx.decimals || 0;
    const isNFT = !tx.reissuable && !decimals && tx.quantity === 1;

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.issueTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min" data-testid="issueType">
              {isNFT
                ? !tx.script
                  ? t('transactions.issueNFT')
                  : t('transactions.issueSmartNFT')
                : !tx.script
                ? t('transactions.issueToken')
                : t('transactions.issueSmartToken')}
            </div>
            <h1 className="headline1">
              <Balance
                data-testid="issueAmount"
                split
                showAsset
                balance={amount}
                showUsdAmount
              />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          {!!tx.description && (
            <div className={styles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.description')}
              </div>
              <div className={styles.txValue} data-testid="issueDescription">
                {tx.description}
              </div>
            </div>
          )}

          {!isNFT && (
            <div className={styles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.decimalPoints')}
              </div>
              <div className={styles.txValue} data-testid="issueDecimals">
                {decimals}
              </div>
            </div>
          )}

          {!isNFT && (
            <div className={styles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.issueType')}
              </div>
              <div className={styles.txValue} data-testid="issueReissuable">
                {t(
                  tx.reissuable
                    ? 'transactions.reissuable'
                    : 'transactions.noReissuable'
                )}
              </div>
            </div>
          )}

          {!!tx.script && (
            <div className={styles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.script')}
              </div>
              <div className={styles.txValue}>
                <ShowScript
                  script={tx.script}
                  showNotify
                  optional
                  hideScript={this.props.collapsed}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const IssueCard = withTranslation()(IssueCardComponent);
