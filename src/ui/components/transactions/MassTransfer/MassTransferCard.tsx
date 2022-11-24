import { Money } from '@waves/data-entities';
import { validators } from '@waves/waves-transactions';
import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { processAliasOrAddress } from 'transactions/utils';

import { getMoney, IMoneyLike } from '../../../utils/converters';
import { readAttachment } from '../../../utils/waves';
import { Attachment, Balance, Spoiler } from '../../ui';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './massTransfer.styl';
import { getAmount, getTransferAmount, messageType } from './parseTx';

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
                isShortFormat
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

class MassTransferCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  state = Object.create(null);

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
                split
                addSign="-"
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
