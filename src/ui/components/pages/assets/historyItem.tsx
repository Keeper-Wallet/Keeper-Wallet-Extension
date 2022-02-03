import cn from 'classnames';
import * as styles from './historyItem.module.css';
import { Balance, Ellipsis, Loader } from '../../ui';
import * as React from 'react';
import { TxIcon } from '../../transactions/BaseTransaction';
import { useAppSelector } from '../../../store';
import { Trans, useTranslation } from 'react-i18next';
import { Asset, Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';
import { Tooltip } from '../../ui/tooltip';
import { getTxDetailLink } from '../../../urls';
import { SWAP_DAPP_ADDRESS } from '../../../../constants';

function Address({ base58 }) {
  return <Ellipsis text={base58} size={12} className="basic500" />;
}

interface Props {
  tx: any;
  className?: string;
}

export function HistoryItem({ tx, className }: Props) {
  const { t } = useTranslation();
  const address = useAppSelector(state => state.selectedAccount.address);
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );
  const assets = useAppSelector(state => state.assets);
  const aliases = useAppSelector(state => state.balances[address]?.aliases);
  const addressAlias = [address, ...(aliases || [])];

  let tooltip, label, info, messageType, addSign;
  const isTxFailed =
    tx.applicationStatus && tx.applicationStatus !== 'succeeded';

  const fromCoins = (amount, assetId) =>
    assets[assetId ?? 'WAVES'] &&
    Money.fromCoins(amount, new Asset(assets[assetId ?? 'WAVES']));

  const fromTokens = (amount, assetId) =>
    assets[assetId ?? 'WAVES'] &&
    Money.fromTokens(amount, new Asset(assets[assetId ?? 'WAVES']));

  switch (tx.type) {
    case TRANSACTION_TYPE.GENESIS:
      tooltip = label = t('historyCard.genesis');
      info = (
        <Balance split showAsset balance={fromCoins(tx.amount, 'WAVES')} />
      );
      messageType = 'receive';
      break;
    case TRANSACTION_TYPE.ISSUE:
      const decimals = tx.decimals || 0;
      const isNFT = !tx.reissuable && !decimals && tx.quantity == 1;
      tooltip = t('historyCard.issue');

      label = isNFT
        ? !tx.script
          ? t('historyCard.issueNFT')
          : t('historyCard.issueSmartNFT')
        : !tx.script
        ? t('historyCard.issueToken')
        : t('historyCard.issueSmartToken');
      info = (
        <Balance split showAsset balance={fromCoins(tx.quantity, tx.assetId)} />
      );
      messageType = 'issue';

      break;
    case TRANSACTION_TYPE.PAYMENT:
    case TRANSACTION_TYPE.TRANSFER:
      tooltip =
        tx.type === TRANSACTION_TYPE.TRANSFER
          ? t('historyCard.transfer')
          : t('historyCard.payment');
      label = <Address base58={tx.recipient} />;
      addSign = '-';
      messageType = 'transfer';

      if (addressAlias.includes(tx.recipient)) {
        tooltip =
          tx.type === TRANSACTION_TYPE.TRANSFER
            ? t('historyCard.transferReceive')
            : t('historyCard.paymentReceive');
        label = <Address base58={tx.sender} />;
        addSign = '+';
        messageType = 'receive';
      }

      if (tx.sender === address && addressAlias.includes(tx.recipient)) {
        tooltip =
          tx.type === TRANSACTION_TYPE.TRANSFER
            ? t('historyCard.transferSelf')
            : t('historyCard.paymentSelf');
        label = <Address base58={tx.sender} />;
        addSign = '';
        messageType = 'self-transfer';
      }

      info = (
        <Balance
          split
          showAsset
          addSign={addSign}
          balance={fromCoins(
            tx.amount,
            tx.type === TRANSACTION_TYPE.TRANSFER ? tx.assetId : 'WAVES'
          )}
        />
      );
      break;
    case TRANSACTION_TYPE.REISSUE:
      tooltip = label = t('historyCard.reissue');
      info = (
        <Balance
          split
          showAsset
          addSign="+"
          balance={fromCoins(tx.quantity, tx.assetId)}
        />
      );
      messageType = 'reissue';
      break;
    case TRANSACTION_TYPE.BURN:
      tooltip = label = t('historyCard.burn');
      info = (
        <Balance
          split
          showAsset
          addSign="-"
          balance={fromCoins(tx.amount, tx.assetId)}
        />
      );
      messageType = 'burn';
      break;
    case TRANSACTION_TYPE.EXCHANGE:
      const priceAssetId = tx.order1?.assetPair?.priceAsset || 'WAVES';
      const priceAsset = assets[priceAssetId];

      const assetAmount = fromCoins(
        tx.amount,
        tx.order1.assetPair.amountAsset || 'WAVES'
      );

      let priceAmount, totalPriceAmount;
      if (assetAmount && priceAsset) {
        priceAmount = fromTokens(
          new BigNumber(tx.price).div(
            new BigNumber(10).pow(
              8 +
                (tx.version < 3
                  ? priceAsset.precision - assetAmount.asset.precision
                  : 0)
            )
          ),
          priceAssetId
        );
        totalPriceAmount = assetAmount.convertTo(
          priceAmount.asset,
          priceAmount.getTokens()
        );
      }

      tooltip = t('historyCard.exchange');
      label = (
        <Balance split showAsset addSign="-" balance={totalPriceAmount} />
      );
      info = <Balance split showAsset addSign="+" balance={assetAmount} />;
      messageType = 'create-order';
      break;
    case TRANSACTION_TYPE.LEASE:
      tooltip = t('historyCard.lease');
      label = <Address base58={tx.recipient} />;
      addSign = '-';

      if (addressAlias.includes(tx.recipient)) {
        tooltip = t('historyCard.leaseIncoming');
        label = <Address base58={tx.sender} />;
        addSign = '+';
      }

      info = (
        <Balance
          split
          showAsset
          addSign={addSign}
          balance={fromCoins(tx.amount, 'WAVES')}
        />
      );
      messageType = 'lease';
      break;
    case TRANSACTION_TYPE.CANCEL_LEASE:
      tooltip = t('historyCard.leaseCancel');
      label = <Address base58={tx.lease.recipient} />;
      addSign = '+';

      if (addressAlias.includes(tx.lease.recipient)) {
        label = <Address base58={tx.lease.sender} />;
        addSign = '-';
      }

      info = (
        <Balance
          split
          showAsset
          addSign={addSign}
          balance={fromCoins(tx.lease.amount, 'WAVES')}
        />
      );
      messageType = 'cancel-leasing';
      break;
    case TRANSACTION_TYPE.ALIAS:
      tooltip = label = t('historyCard.createAlias');
      info = tx.alias;
      messageType = 'create-alias';
      break;
    case TRANSACTION_TYPE.MASS_TRANSFER:
      tooltip = t('historyCard.massTransferReceive');
      label = <Address base58={tx.sender} />;

      addSign = '+';
      let balance = fromCoins(
        tx.transfers.reduce(
          (
            result: BigNumber,
            transfer: { amount: number; recipient: string }
          ) =>
            result.add(
              addressAlias.includes(transfer.recipient) ? transfer.amount : 0
            ),
          new BigNumber(0)
        ),
        tx.assetId
      );
      messageType = 'mass_transfer_receive';

      if (tx.sender === address) {
        tooltip = t('historyCard.massTransfer');
        label = t('historyCard.massTransferRecipient', {
          count: tx.transfers.length,
        });
        addSign = '-';
        balance = fromCoins(tx.totalAmount, tx.assetId);
        messageType = 'mass_transfer';
      }

      info = <Balance split showAsset addSign={addSign} balance={balance} />;
      break;
    case TRANSACTION_TYPE.DATA:
      tooltip = t('historyCard.dataTransaction');
      label = t('historyCard.dataTransactionEntry', { count: tx.data.length });
      messageType = 'data';
      break;
    case TRANSACTION_TYPE.SET_SCRIPT:
      tooltip = label = t('historyCard.setScript');
      messageType = 'set-script';

      if (!tx.script) {
        label = t('historyCard.setScriptCancel');
        messageType = 'set-script-cancel';
      }

      break;
    case TRANSACTION_TYPE.SPONSORSHIP:
      tooltip = label = t('historyCard.sponsorshipEnable');
      messageType = 'sponsor_enable';
      info = (
        <Balance
          split
          showAsset
          balance={fromCoins(tx.minSponsoredAssetFee, tx.assetId)}
        />
      );

      if (!tx.minSponsoredAssetFee) {
        tooltip = label = t('historyCard.sponsorshipDisable');
        info = assets[tx.assetId]?.displayName;
        messageType = 'sponsor_disable';
      }
      break;
    case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      tooltip = label = t('historyCard.setAssetScript');
      info = assets[tx.assetId]?.displayName;
      messageType = 'set-asset-script';
      break;
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      if (
        (tx.dApp === '3P8eoZF8RTpcrVXwYcDaNs7WBGMbrBR8d3u' &&
          tx.call.function === 'swap') ||
        (tx.dApp === SWAP_DAPP_ADDRESS && tx.call.function === 'testSeq')
      ) {
        tooltip = t('historyCard.swap');

        const payment = tx.payment[0];
        const fromBalance =
          payment && fromCoins(payment.amount, payment.assetId);

        const incomingTransfer = tx.stateChanges.transfers.find(
          t => t.address === tx.sender
        );

        const toBalance =
          incomingTransfer &&
          fromCoins(incomingTransfer.amount, incomingTransfer.asset);

        label = <Balance addSign="-" split showAsset balance={fromBalance} />;
        info = <Balance addSign="+" split showAsset balance={toBalance} />;
        messageType = 'swap';
      } else {
        tooltip = t('historyCard.scriptInvocation');
        label = <Address base58={tx.dApp} />;
        info = tx.call?.function || 'default';
        messageType = 'script_invocation';
      }
      break;
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
      tooltip = label = t('history.updateAssetInfo');
      info = assets[tx.assetId]?.displayName;
      messageType = 'issue';
      break;
    default:
      label = <Loader />;
      info = <Loader />;
      messageType = 'unknown';
      break;
  }

  return (
    <div className={cn(styles.historyCard, className, 'flex')}>
      <Tooltip
        content={`${(isTxFailed && t('historyCard.failed')) || ''} ${tooltip}`}
        placement="right"
      >
        {props => (
          <div
            className={cn(
              styles.historyIconWrapper,
              messageType === 'unknown' && 'skeleton-glow'
            )}
            {...props}
          >
            <TxIcon txType={messageType} className={styles.historyIcon} />
            {isTxFailed && (
              <div className={styles.txSubIconContainer}>
                <div className={styles.txSubIcon}>
                  <svg viewBox="0 0 10 10" className={styles.txSubIconSvg}>
                    <path
                      d="M5.64011 5.00002L8.20071 2.43942C8.37749 2.26264 8.37749 1.97604 8.20071 1.79927C8.02394 1.62249 7.73733 1.62249 7.56056 1.79927L4.99996 4.35987L2.43936 1.79927C2.26258 1.62249 1.97598 1.62249 1.79921 1.79927C1.62243 1.97604 1.62243 2.26264 1.79921 2.43942L4.35981 5.00002L1.79921 7.56062C1.62243 7.7374 1.62243 8.024 1.79921 8.20077C1.97598 8.37755 2.26258 8.37755 2.43936 8.20077L4.99996 5.64017L7.56056 8.20077C7.73733 8.37755 8.02394 8.37755 8.20071 8.20077C8.37749 8.024 8.37749 7.7374 8.20071 7.56062L5.64011 5.00002Z"
                      fill="#E5494D"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
      </Tooltip>

      <div className={cn('body1', styles.historyData)}>
        <div
          className={cn(
            info && typeof label === 'string' && 'basic500',
            styles.historyLabel
          )}
          title={typeof label === 'string' ? label : ''}
        >
          {label}
        </div>
        {!!info && <div className={styles.historyInfo}>{info}</div>}
      </div>

      <Tooltip content={<Trans i18nKey="historyCard.infoTooltip" />}>
        {props => (
          <button
            className={styles.infoButton}
            type="button"
            onClick={() => {
              window.open(
                getTxDetailLink(networkCode, tx.id),
                '_blank',
                'noopener'
              );
            }}
            {...props}
          >
            <svg className={styles.infoIcon} viewBox="0 0 28 26">
              <path d="M25 13c0 6.075-4.925 11-11 11S3 19.075 3 13 7.925 2 14 2s11 4.925 11 11ZM4 13c0 5.523 4.477 10 10 10s10-4.477 10-10S19.523 3 14 3 4 7.477 4 13Z" />
              <path d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 14 11Z" />
            </svg>
          </button>
        )}
      </Tooltip>
    </div>
  );
}
