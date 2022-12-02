import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { getMoney } from '../../../utils/converters';
import { Balance } from '../../ui';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './cancelLease.styl';
import { getAmount, messageType } from './parseTx';

class CancelLeaseCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = clsx(
      styles.cancelLeaseTransactionCard,
      this.props.className,
      {
        [styles.cancelLeaseCardCollapsed]: this.props.collapsed,
      }
    );

    const { t, message, assets } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
    const amount = getMoney(getAmount(tx), assets);
    const recipient = tx.lease?.recipient;

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.cancelLeaseTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.leaseCancel')}
            </div>
            <h1 className="headline1">
              <Balance
                data-testid="cancelLeaseAmount"
                split
                showAsset
                balance={amount}
                showUsdAmount
              />
            </h1>
          </div>
        </div>

        {recipient && (
          <div className={styles.cardContent}>
            <div className={styles.txRow}>
              <div className="tx-title tag1 basic500">
                {t('transactions.recipient')}
              </div>
              <div className={styles.txValue}>
                <AddressRecipient
                  recipient={recipient}
                  chainId={tx.chainId}
                  testid="cancelLeaseRecipient"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export const CancelLeaseCard = withTranslation()(CancelLeaseCardComponent);
