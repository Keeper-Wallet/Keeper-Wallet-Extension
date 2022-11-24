import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { getMoney } from '../../../utils/converters';
import { Balance } from '../../ui';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import { getAmount, messageType } from './parseTx';
import * as styles from './reissue.styl';

class ReissueCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.reissueTransactionCard, this.props.className, {
      [styles.reissueCardCollapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
    const amount = getMoney(getAmount(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.reissueTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.reissue')}
            </div>
            <h1 className="headline1">
              <Balance
                data-testid="reissueAmount"
                split
                addSign="+"
                showAsset
                balance={amount}
                showUsdAmount
              />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.txRow}>
            <div className="tx-title tag1 basic500">
              {t('transactions.issueType')}
            </div>
            <div className={styles.txValue} data-testid="reissueReissuable">
              {t(
                tx.reissuable
                  ? 'transactions.reissuable'
                  : 'transactions.noReissuable'
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const ReissueCard = withTranslation()(ReissueCardComponent);
