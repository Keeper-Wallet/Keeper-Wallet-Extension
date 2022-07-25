import * as styles from './massTransfer.styl';
import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { validators } from '@waves/waves-transactions';
import { processAliasOrAddress } from 'transactions/utils';
import { ComponentProps, MessageData, TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { Attachment, Balance, Spoiler } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, getTransferAmount, messageType } from './parseTx';
import { readAttachment } from '../../../utils/waves';

const showAliasWarning = (transfers, chainId) =>
  transfers.some(({ recipient }) =>
    validators.isValidAlias(processAliasOrAddress(recipient, chainId))
  );

const MIN_COUNT = 0;

const Transfers = ({ transfers, totalAmount, chainId, count = MIN_COUNT }) => {
  const assets = { [totalAmount.asset.id]: totalAmount.asset };

  return transfers.slice(0, count).map(({ recipient, amount }) => {
    const money = getMoney(
      getTransferAmount(amount, totalAmount.asset.id),
      assets
    );

    return (
      <div key={recipient} className={styles.massTransferItem}>
        <AddressRecipient
          className={styles.massTransferRecipient}
          recipient={recipient}
          chainId={chainId}
          showAliasWarning={false}
        />
        <div className="body3 submit400">
          <Balance
            isShortFormat={true}
            balance={money}
            showAsset={false}
            showUsdAmount
          />
        </div>
      </div>
    );
  });
};

class MassTransferCardComponent extends React.PureComponent<ComponentProps> {
  readonly state = Object.create(null);

  toggleShowRecipients = count => {
    this.setState({ count });
  };

  render() {
    const className = cn(
      styles.massTransferTransactionCard,
      this.props.className,
      {
        [styles.massTransferCardCollapsed]: this.props.collapsed,
      }
    );

    const { t, message, assets, collapsed } = this.props;
    const { data = {} as MessageData } = message;
    const tx = { type: data.type, ...data.data };
    const amount = getMoney(getAmount(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.massTransferTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.massTransfer')}
            </div>
            <h1 className="headline1">
              <Balance
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
              {t('transactions.recipients')}
            </div>
            <Spoiler
              className={styles.massTransferSpoiler}
              count={tx.transfers.length}
              title={t('transactions.recipients')}
              expanded={!collapsed}
            >
              <Transfers
                transfers={tx.transfers}
                chainId={tx.chainId}
                totalAmount={amount}
                count={tx.transfers.length}
              />
            </Spoiler>
            {showAliasWarning(tx.transfers, tx.chainId) && (
              <p className={styles.massTransferWarningAlias}>
                {t('address.warningAlias')}
              </p>
            )}
          </div>

          {tx.attachment && tx.attachment.length ? (
            <div className={`${styles.txRow} ${styles.txRowDescription}`}>
              <div className="tx-title tag1 basic500">
                {t('transactions.attachment')}
              </div>
              <Attachment
                className="plate fullwidth"
                attachment={readAttachment(tx.attachment)}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export const MassTransferCard = withTranslation()(MassTransferCardComponent);
