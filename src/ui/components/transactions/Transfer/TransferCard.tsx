import * as styles from './transfer.styl';
import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { ComponentProps, MessageData, TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Attachment, Balance } from '../../ui';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';
import { readAttachment } from '../../../utils/waves';

class TransferCardComponent extends React.PureComponent<ComponentProps> {
  render() {
    const className = cn(styles.transferTransactionCard, this.props.className, {
      [styles.transferCardCollapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;
    const { data = {} as MessageData } = message;
    const tx = { type: data.type, ...data.data };
    const amount = getMoney(getAmount(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.transferTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.transfer')}
            </div>
            <h1 className="headline1">
              <Balance
                data-testid="transferAmount"
                split={true}
                addSign="-"
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
              <AddressRecipient
                recipient={tx.recipient}
                chainId={tx.chainId}
                testid="recipient"
              />
            </div>
          </div>

          {tx.attachment && tx.attachment.length ? (
            <div className={`${styles.txRow} ${styles.txRowDescription}`}>
              <div className="tx-title tag1 basic500">
                {t('transactions.attachment')}
              </div>
              <Attachment
                attachment={readAttachment(tx.attachment)}
                className={`${styles.txValue} plate fullwidth`}
                data-testid="attachmentContent"
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export const TransferCard = withTranslation()(TransferCardComponent);
