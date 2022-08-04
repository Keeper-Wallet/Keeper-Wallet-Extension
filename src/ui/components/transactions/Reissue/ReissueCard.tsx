import * as styles from './reissue.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';
import { MessageCardComponentProps } from '../types';

class ReissueCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.reissueTransactionCard, this.props.className, {
      [styles.reissueCardCollapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
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
                split={true}
                addSign="+"
                showAsset={true}
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
            <div className={styles.txValue}>
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
