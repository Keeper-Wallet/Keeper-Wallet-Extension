import cn from 'classnames';
import * as styles from './historyItem.module.css';
import { Balance, Ellipsis, Loader } from '../../ui';
import * as React from 'react';
import { TxIcon } from '../../transactions/BaseTransaction';
import { useAppSelector } from '../../../store';
import { Trans, useTranslation } from 'react-i18next';
import { Asset, Money } from '@waves/data-entities';
import { getTxLink } from './helpers';
import { BigNumber } from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';

function Address({ base58 }) {
  return <Ellipsis text={base58} size={12} className="basic500" />;
}

interface Props {
  tx: any;
  className?: string;
  onClick?: (assetId: string) => void;
}

export function HistoryItem({ tx, className, onClick }: Props) {
  const { t } = useTranslation();
  const address = useAppSelector(state => state.selectedAccount.address);
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );
  const assets = useAppSelector(state => state.assets);
  const aliases = useAppSelector(state => state.aliases);

  let tooltip, label, info, messageType, addSign;
  const isTxFailed = tx.applicationStatus === 'failed';
  let assetId = tx.assetId || 'WAVES';
  let asset = assets[assetId];

  switch (tx.type) {
    case TRANSACTION_TYPE.GENESIS:
      tooltip = label = t('historyCard.genesis');
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          balance={asset && new Money(tx.amount, new Asset(asset))}
        />
      );
      messageType = 'receive';
      break;
    case TRANSACTION_TYPE.ISSUE:
      const decimals = tx.precision || tx.decimals || 0;
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
        <Balance
          split
          showAsset
          assetId={assetId}
          balance={asset && new Money(tx.quantity, new Asset(asset))}
        />
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

      if (tx.recipient === address) {
        tooltip =
          tx.type === TRANSACTION_TYPE.TRANSFER
            ? t('historyCard.transferReceive')
            : t('historyCard.paymentReceive');
        label = <Address base58={tx.sender} />;
        addSign = '+';
        messageType = 'receive';
      }

      if (tx.sender === tx.recipient) {
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
          assetId={assetId}
          balance={asset && new Money(tx.amount, new Asset(asset))}
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
          assetId={assetId}
          balance={asset && new Money(tx.quantity, new Asset(asset))}
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
          assetId={assetId}
          balance={asset && new Money(tx.amount, new Asset(asset))}
        />
      );
      messageType = 'burn';
      break;
    case TRANSACTION_TYPE.EXCHANGE:
      assetId = tx.order1.assetPair.amountAsset || 'WAVES';
      asset = assets[assetId];
      const priceAssetId = tx.order1?.assetPair?.priceAsset || 'WAVES';
      const priceAsset = assets[priceAssetId];

      let assetAmount = null,
        totalPriceAmount = null;
      if (asset) {
        assetAmount = new Money(tx.order1.amount, new Asset(asset));

        if (priceAsset) {
          const priceAmount = new Money(
            new BigNumber(tx.order1.price).div(
              new BigNumber(10).pow(
                8 +
                  (tx.order1.version < 3
                    ? priceAsset.precision - asset.precision
                    : 0)
              )
            ),
            new Asset(priceAsset)
          );
          totalPriceAmount = assetAmount.convertTo(
            priceAmount.asset,
            priceAmount.getTokens()
          );
        }
      }

      tooltip = t('historyCard.exchange');
      label = (
        <Balance
          split
          showAsset
          assetId={priceAssetId}
          addSign="-"
          balance={totalPriceAmount}
        />
      );
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          addSign="+"
          balance={assetAmount}
        />
      );
      messageType = 'create-order';
      break;
    case TRANSACTION_TYPE.LEASE:
      tooltip = t('historyCard.lease');
      label = <Address base58={tx.recipient} />;
      addSign = '-';

      if (tx.recipient === address) {
        tooltip = t('historyCard.leaseIncoming');
        label = <Address base58={tx.sender} />;
        addSign = '+';
      }

      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          addSign={addSign}
          balance={asset && new Money(tx.amount, new Asset(asset))}
        />
      );
      messageType = 'lease';
      break;
    case TRANSACTION_TYPE.CANCEL_LEASE:
      tooltip = t('historyCard.leaseCancel');
      label = <Address base58={tx.lease.recipient} />;
      addSign = '+';

      if (tx.lease.recipient === address) {
        label = <Address base58={tx.lease.sender} />;
        addSign = '-';
      }

      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          addSign={addSign}
          balance={asset && new Money(tx.lease.amount, new Asset(asset))}
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
      let balance =
        asset &&
        new Money(
          tx.transfers.reduce(
            (
              result: BigNumber,
              transfer: { amount: number; recipient: string }
            ) =>
              result.add(
                [address, ...aliases].includes(transfer.recipient)
                  ? transfer.amount
                  : 0
              ),
            new BigNumber(0)
          ),
          new Asset(asset)
        );
      messageType = 'mass_transfer_receive';

      if (tx.sender === address) {
        tooltip = t('historyCard.massTransfer');
        label = t('historyCard.massTransferRecipient', {
          count: tx.transfers.length,
        });
        addSign = '-';
        balance = asset && new Money(tx.totalAmount, new Asset(asset));
        messageType = 'mass_transfer';
      }

      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          addSign={addSign}
          balance={balance}
        />
      );
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
          assetId={assetId}
          balance={
            asset && new Money(tx.minSponsoredAssetFee, new Asset(asset))
          }
        />
      );

      if (!tx.minSponsoredAssetFee) {
        tooltip = label = t('historyCard.sponsorshipDisable');
        info = asset.displayName;
        messageType = 'sponsor_disable';
      }
      break;
    case TRANSACTION_TYPE.SET_ASSET_SCRIPT:
      tooltip = label = t('historyCard.setAssetScript');
      info = asset.displayName;
      messageType = 'set-asset-script';
      break;
    case TRANSACTION_TYPE.INVOKE_SCRIPT:
      tooltip = t('historyCard.scriptInvocation');
      label = <Address base58={tx.dApp} />;
      info = tx.call?.function || 'default';
      messageType = 'script_invocation';
      break;
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
      tooltip = label = t('history.updateAssetInfo');
      info = asset.displayName;
      messageType = 'issue';
      break;
    default:
      label = <Loader />;
      info = <Loader />;
      messageType = 'unknown';
      break;
  }

  return (
    <div
      className={cn(styles.historyCard, className, 'flex')}
      onClick={() => onClick(assetId)}
    >
      <div className={cn(styles.historyIconWrapper, 'showTooltip')}>
        <TxIcon txType={messageType} className={styles.historyIcon} />
        {isTxFailed && (
          <div className={styles.txSubIconContainer}>
            <div className={styles.txSubIcon}>
              <svg viewBox="0 0 10 10" className={styles.txSubIconSvg}>
                <rect
                  width="10"
                  height="10"
                  fill="#D8D8D8"
                  fillOpacity="0.01"
                />
                <path
                  d="M5.64011 5.00002L8.20071 2.43942C8.37749 2.26264 8.37749 1.97604 8.20071 1.79927C8.02394 1.62249 7.73733 1.62249 7.56056 1.79927L4.99996 4.35987L2.43936 1.79927C2.26258 1.62249 1.97598 1.62249 1.79921 1.79927C1.62243 1.97604 1.62243 2.26264 1.79921 2.43942L4.35981 5.00002L1.79921 7.56062C1.62243 7.7374 1.62243 8.024 1.79921 8.20077C1.97598 8.37755 2.26258 8.37755 2.43936 8.20077L4.99996 5.64017L7.56056 8.20077C7.73733 8.37755 8.02394 8.37755 8.20071 8.20077C8.37749 8.024 8.37749 7.7374 8.20071 7.56062L5.64011 5.00002Z"
                  fill="#E5494D"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {tooltip && (
        <div className={cn(styles.txIconTooltip, 'tooltip', 'tooltip-right')}>
          {isTxFailed && t('historyCard.failed')} {tooltip}
        </div>
      )}

      <div className={cn('body1', styles.historyData)}>
        <div
          className={cn(
            info && typeof label === 'string' && 'basic500',
            styles.historyLabel
          )}
          title={typeof label === 'string' ? label : ''}
        >
          {!asset ? <Loader /> : label}
        </div>
        {!!info && <div className={styles.historyInfo}>{info}</div>}
      </div>

      <button
        className={cn(styles.infoButton, 'showTooltip')}
        type="button"
        onClick={() => {
          window.open(getTxLink(tx.id, networkCode), '_blank', 'noopener');
        }}
      >
        <svg className={styles.infoIcon} viewBox="0 0 28 26">
          <path d="M25 13c0 6.075-4.925 11-11 11S3 19.075 3 13 7.925 2 14 2s11 4.925 11 11ZM4 13c0 5.523 4.477 10 10 10s10-4.477 10-10S19.523 3 14 3 4 7.477 4 13Z" />
          <path d="M14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 14 11Z" />
        </svg>
      </button>

      <div className={cn(styles.infoTooltip, 'tooltip')}>
        <Trans i18nKey="historyCard.infoTooltip" />
      </div>
    </div>
  );
}
