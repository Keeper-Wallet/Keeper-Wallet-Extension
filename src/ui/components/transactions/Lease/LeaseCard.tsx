import * as styles from './lease.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';
import { MessageCardComponentProps } from '../types';

class LeaseCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(styles.leaseTransactionCard, this.props.className, {
      [styles.leaseCardCollapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
    const amount = getMoney(getAmount(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.leaseTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.lease')}
            </div>
            <h1 className="headline1">
              <Balance
                split={true}
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
              {t('transactions.recipient')}
            </div>
            <div className={styles.txValue}>
              <AddressRecipient recipient={tx.recipient} chainId={tx.chainId} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const LeaseCard = withTranslation()(LeaseCardComponent);
