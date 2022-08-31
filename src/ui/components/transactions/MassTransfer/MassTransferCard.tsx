import * as styles from './massTransfer.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { validators } from '@waves/waves-transactions';
import { processAliasOrAddress } from 'transactions/utils';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { Attachment, Balance, Spoiler } from '../../ui';
import { getMoney, IMoneyLike } from '../../../utils/converters';
import { getAmount, getTransferAmount, messageType } from './parseTx';
import { readAttachment } from '../../../utils/waves';
import { Money } from '@waves/data-entities';
import { MessageCardComponentProps } from '../types';

interface ITransfer {
  recipient: string;
  amount: IMoneyLike | string;
}

const showAliasWarning = (transfers: ITransfer[], chainId: number) =>
  transfers.some(({ recipient }) =>
    validators.isValidAlias(processAliasOrAddress(recipient, chainId))
  );

const MIN_COUNT = 0;

const Transfers = ({
  transfers,
  totalAmount,
  chainId,
  count = MIN_COUNT,
}: {
  transfers: ITransfer[];
  totalAmount: Money;
  chainId: number;
  count?: number;
}) => {
  const assets = { [totalAmount.asset.id]: totalAmount.asset };

  return (
    <>
      {transfers.slice(0, count).map(({ recipient, amount }) => {
        const money = getMoney(
          getTransferAmount(amount, totalAmount.asset.id),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          assets as any
        );

        return (
          <div
            key={recipient}
            className={styles.massTransferItem}
            data-testId="massTransferItem"
          >
            <AddressRecipient
              className={styles.massTransferRecipient}
              testid="massTransferItemRecipient"
              recipient={recipient}
              chainId={chainId}
              showAliasWarning={false}
            />
            <div className="body3 submit400">
              <Balance
                data-testid="massTransferItemAmount"
                isShortFormat={true}
                balance={money}
                showAsset={false}
                showUsdAmount
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

class MassTransferCardComponent extends React.PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  state = Object.create(null);

  private toggleShowRecipients = (count: unknown) => {
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

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
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
                data-testid="massTransferAmount"
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                totalAmount={amount!}
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
                data-testid="massTransferAttachment"
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
