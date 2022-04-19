import * as styles from './transfer.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Attachment, Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';
import { readAttachment } from '../../../utils/waves';

interface IProps {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

export class TransferCard extends React.PureComponent<IProps> {
  render() {
    const className = cn(styles.transferTransactionCard, this.props.className, {
      [styles.transferCard_collapsed]: this.props.collapsed,
    });

    const { message, assets } = this.props;
    const { data = {} } = message;
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
              <Trans i18nKey="transactions.transfer" />
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
              <Trans i18nKey="transactions.recipient" />
            </div>
            <div className={styles.txValue} data-testid="recipient">
              {tx.recipient}
            </div>
          </div>

          {tx.attachment && tx.attachment.length ? (
            <div className={`${styles.txRow} ${styles.txRowDescription}`}>
              <div className="tx-title tag1 basic500">
                <Trans i18nKey="transactions.attachment" />
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
