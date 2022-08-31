import * as styles from './cancelLease.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';
import { MessageCardComponentProps } from '../types';

class CancelLeaseCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = cn(
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
                split={true}
                showAsset={true}
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
