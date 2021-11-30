import cn from 'classnames';
import * as styles from './historyItem.module.css';
import { Balance, Loader } from '../../ui';
import * as React from 'react';
import { TxIcon } from '../../transactions/BaseTransaction';
import { SIGN_TYPE } from '@waves/signature-adapter';
import { useAppSelector } from '../../../store';
import { Trans, useTranslation } from 'react-i18next';
import { Asset, Money } from '@waves/data-entities';
import { getTxLink } from './helpers';
import { BigNumber } from '@waves/bignumber';

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
  let assetId = tx.assetId || 'WAVES';
  let asset = assets[assetId];

  switch (tx.type) {
    case SIGN_TYPE.ISSUE:
      const decimals = tx.precision || tx.decimals || 0;
      const isNFT = !tx.reissuable && !decimals && tx.quantity == 1;
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
    case SIGN_TYPE.TRANSFER:
      tooltip = t('historyCard.transfer');
      label = tx.recipient;
      addSign = '-';
      messageType = 'transfer';

      if (tx.recipient === address) {
        tooltip = t('historyCard.receive');
        label = tx.sender;
        addSign = '+';
        messageType = 'receive';
      }

      if (tx.sender === tx.recipient) {
        tooltip = t('historyCard.selfTransfer');
        label = tx.sender;
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
    case SIGN_TYPE.REISSUE:
      label = t('historyCard.reissue');
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
    case SIGN_TYPE.BURN:
      label = t('historyCard.burn');
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
    case SIGN_TYPE.EXCHANGE:
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
    case SIGN_TYPE.LEASE:
      tooltip = t('historyCard.lease');
      label = tx.recipient;
      addSign = '-';

      if (tx.recipient === address) {
        tooltip = t('historyCard.leaseIncoming');
        label = tx.sender;
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
    case SIGN_TYPE.CANCEL_LEASING:
      tooltip = t('historyCard.leaseCancel');
      label = tx.lease.recipient;
      addSign = '+';

      if (tx.lease.recipient === address) {
        label = tx.lease.sender;
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
    case SIGN_TYPE.CREATE_ALIAS:
      label = t('historyCard.createAlias');
      info = tx.alias;
      messageType = 'create-alias';
      break;
    case SIGN_TYPE.MASS_TRANSFER:
      tooltip = t('historyCard.massTransferReceive');
      label = tx.sender;

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
    case SIGN_TYPE.DATA:
      tooltip = t('historyCard.dataTransaction');
      label = t('historyCard.dataTransactionEntry', { count: tx.data.length });
      messageType = 'data';
      break;
    case SIGN_TYPE.SET_SCRIPT:
      label = t('historyCard.setScript');
      messageType = 'set-script';

      if (!tx.script) {
        label = t('historyCard.setScriptCancel');
        messageType = 'set-script-cancel';
      }

      break;
    case SIGN_TYPE.SPONSORSHIP:
      label = t('historyCard.sponsorshipEnable');
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
        label = t('historyCard.sponsorshipDisable');
        info = asset.displayName;
        messageType = 'sponsor_disable';
      }
      break;
    case SIGN_TYPE.SET_ASSET_SCRIPT:
      label = t('historyCard.setAssetScript');
      info = asset.displayName;
      messageType = 'set-asset-script';
      break;
    case SIGN_TYPE.SCRIPT_INVOCATION:
      tooltip = t('historyCard.scriptInvocation');
      label = tx.dApp;
      info = tx.call?.function || 'default';
      messageType = 'script_invocation';
      break;
    case SIGN_TYPE.UPDATE_ASSET_INFO:
      label = t('history.updateAssetInfo');
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
      </div>

      {tooltip && (
        <div className={cn(styles.txIconTooltip, 'tooltip', 'tooltip-right')}>
          {tooltip}
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
