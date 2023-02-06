import { BigNumber } from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import {
  type Long,
  TRANSACTION_TYPE,
  type TransactionFromNode,
} from '@waves/ts-types';
import clsx from 'clsx';
import { MessageIcon } from 'messages/_common/icon';
import { useTranslation } from 'react-i18next';

import { InfoIcon } from '../../../../icons/info';
import { usePopupSelector } from '../../../../popup/store/react';
import { getTxDetailLink } from '../../../urls';
import { Balance, Loader } from '../../ui';
import { AddressRecipient } from '../../ui/Address/Recipient';
import { Tooltip } from '../../ui/tooltip';
import * as styles from './historyItem.module.css';

interface Props {
  tx: TransactionFromNode;
  className?: string;
}

export function HistoryItem({ tx, className }: Props) {
  const { t } = useTranslation();
  const address = usePopupSelector(state => state.selectedAccount?.address);
  const networkCode = usePopupSelector(
    state => state.selectedAccount?.networkCode
  );
  const chainId = usePopupSelector(state =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    state.selectedAccount?.networkCode!.charCodeAt(0)
  );
  const assets = usePopupSelector(state => state.assets);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const aliases = usePopupSelector(state => state.balances[address!]?.aliases);
  const addressAlias = [address, ...(aliases || [])];

  let tooltip, label, info, messageType: string, addSign;
  const isTxFailed =
    'applicationStatus' in tx &&
    tx.applicationStatus &&
    tx.applicationStatus !== 'succeeded';

  const fromCoins = (amount: Long | BigNumber, assetId?: string | null) => {
    const asset = assets[assetId ?? 'WAVES'];
    return asset && Money.fromCoins(amount, new Asset(asset));
  };

  const fromTokens = (amount: Long | BigNumber, assetId?: string | null) => {
    const asset = assets[assetId ?? 'WAVES'];

    return asset && Money.fromTokens(amount, new Asset(asset));
  };

  switch (tx.type) {
    case TRANSACTION_TYPE.GENESIS:
      tooltip = label = t('historyCard.genesis');
      info = (
        <Balance split showAsset balance={fromCoins(tx.amount, 'WAVES')} />
      );
      messageType = 'receive';
      break;
    case TRANSACTION_TYPE.ISSUE: {
      const decimals = tx.decimals || 0;
      const isNFT = !tx.reissuable && !decimals && tx.quantity === 1;
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
    }
    case TRANSACTION_TYPE.PAYMENT:
    case TRANSACTION_TYPE.TRANSFER:
      tooltip =
        tx.type === TRANSACTION_TYPE.TRANSFER
          ? t('historyCard.transfer')
          : t('historyCard.payment');
      label = (
        <AddressRecipient
          className={styles.recipient}
          recipient={tx.recipient}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          chainId={chainId!}
          showAliasWarning={false}
        />
      );
      addSign = '-';
      messageType = 'transfer';

      if (addressAlias.includes(tx.recipient)) {
        tooltip =
          tx.type === TRANSACTION_TYPE.TRANSFER
            ? t('historyCard.transferReceive')
            : t('historyCard.paymentReceive');
        label = (
          <AddressRecipient
            className={styles.recipient}
            recipient={tx.sender}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chainId={chainId!}
            showAliasWarning={false}
          />
        );
        addSign = '+';
        messageType = 'receive';
      }

      if (tx.sender === address && addressAlias.includes(tx.recipient)) {
        tooltip =
          tx.type === TRANSACTION_TYPE.TRANSFER
            ? t('historyCard.transferSelf')
            : t('historyCard.paymentSelf');
        label = (
          <AddressRecipient
            className={styles.recipient}
            recipient={tx.sender}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chainId={chainId!}
            showAliasWarning={false}
          />
        );
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
    case TRANSACTION_TYPE.EXCHANGE: {
      const priceAssetId = tx.order1?.assetPair?.priceAsset || 'WAVES';
      const priceAsset = assets[priceAssetId];

      const assetAmount = fromCoins(
        tx.amount,
        tx.order1.assetPair.amountAsset || 'WAVES'
      );

      let priceAmount: Money | undefined;
      let totalPriceAmount: Money | undefined;

      if (assetAmount && priceAsset) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        )!;

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
    }
    case TRANSACTION_TYPE.LEASE:
      tooltip = t('historyCard.lease');
      label = (
        <AddressRecipient
          className={styles.recipient}
          recipient={tx.recipient}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          chainId={chainId!}
          showAliasWarning={false}
        />
      );
      addSign = '-';

      if (addressAlias.includes(tx.recipient)) {
        tooltip = t('historyCard.leaseIncoming');
        label = (
          <AddressRecipient
            className={styles.recipient}
            recipient={tx.sender}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chainId={chainId!}
            showAliasWarning={false}
          />
        );
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
      label = (
        <AddressRecipient
          className={styles.recipient}
          recipient={tx.lease.recipient}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          chainId={chainId!}
          showAliasWarning={false}
        />
      );
      addSign = '+';

      if (addressAlias.includes(tx.lease.recipient)) {
        label = (
          <AddressRecipient
            className={styles.recipient}
            recipient={tx.lease.sender}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chainId={chainId!}
            showAliasWarning={false}
          />
        );
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
    case TRANSACTION_TYPE.MASS_TRANSFER: {
      tooltip = t('historyCard.massTransferReceive');
      label = (
        <AddressRecipient
          className={styles.recipient}
          recipient={tx.sender}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          chainId={chainId!}
          showAliasWarning={false}
        />
      );

      addSign = '+';
      let balance = fromCoins(
        tx.transfers.reduce(
          (result, transfer) =>
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
    }
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          balance={fromCoins(tx.minSponsoredAssetFee!, tx.assetId)}
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
          tx.call?.function === 'swap') ||
        (tx.dApp === '3P5UKXpQbom7GB2WGdPG5yGQPeQQuM3hFmw' &&
          tx.call &&
          [
            'testSeq',
            'swap',
            'swapWithRefferer',
            'swopfiSwap',
            'swopfiSwapWithReferrer',
            'puzzleSwap',
            'puzzleSwapWithReferrer',
          ].includes(tx.call.function)) ||
        (tx.dApp === '3PGFHzVGT4NTigwCKP1NcwoXkodVZwvBuuU' &&
          tx.call?.function === 'swapWithReferral')
      ) {
        tooltip = t('historyCard.swap');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const payment = tx.payment![0];
        const fromBalance =
          payment && fromCoins(payment.amount, payment.assetId);

        const incomingTransfer = tx.stateChanges.transfers.find(
          // eslint-disable-next-line @typescript-eslint/no-shadow
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
        label = (
          <AddressRecipient
            className={styles.recipient}
            recipient={tx.dApp}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            chainId={chainId!}
            showAliasWarning={false}
          />
        );
        info = tx.call?.function || 'default';
        messageType = 'script_invocation';
      }
      break;
    case TRANSACTION_TYPE.UPDATE_ASSET_INFO:
      tooltip = label = t('history.updateAssetInfo');
      info = assets[tx.assetId]?.displayName;
      messageType = 'issue';
      break;
    case TRANSACTION_TYPE.ETHEREUM: {
      const payload = tx.payload;

      switch (payload.type) {
        case 'transfer':
          tooltip = t('historyCard.transferReceive');
          label = (
            <AddressRecipient
              className={styles.recipient}
              recipient={tx.sender}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              chainId={chainId!}
              showAliasWarning={false}
              showMirrorAddress
            />
          );
          addSign = '+';
          messageType = 'receive';
          info = (
            <Balance
              split
              showAsset
              addSign={addSign}
              balance={fromCoins(payload.amount, payload.asset)}
            />
          );
          break;
        case 'invocation':
          tooltip = t('historyCard.scriptInvocation');
          label = (
            <AddressRecipient
              className={styles.recipient}
              recipient={payload.dApp}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              chainId={chainId!}
              showAliasWarning={false}
            />
          );
          info = payload.call?.function || 'default';
          messageType = 'script_invocation';
          break;
        default:
          tooltip = label = null;
      }
      break;
    }
    default:
      label = <Loader />;
      info = <Loader />;
      messageType = 'unknown';
      break;
  }

  return (
    <div className={clsx(styles.historyCard, className, 'flex')}>
      <Tooltip
        content={`${(isTxFailed && t('historyCard.failed')) || ''} ${tooltip}`}
        placement="right"
      >
        {props => (
          <div
            className={clsx(
              styles.historyIconWrapper,
              messageType === 'unknown' && 'skeleton-glow'
            )}
            {...props}
          >
            <MessageIcon type={messageType} className={styles.historyIcon} />
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

      <div className={clsx('body1', styles.historyData)}>
        <div
          className={clsx(
            info && typeof label === 'string' && 'basic500',
            styles.historyLabel
          )}
          title={typeof label === 'string' ? label : ''}
        >
          {label}
        </div>
        {!!info && <div className={styles.historyInfo}>{info}</div>}
      </div>

      <Tooltip content={t('historyCard.infoTooltip')}>
        {props => (
          <button
            className={styles.infoButton}
            type="button"
            onClick={() => {
              window.open(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                getTxDetailLink(networkCode!, tx.id),
                '_blank',
                'noopener'
              );
            }}
            {...props}
          >
            <InfoIcon className={styles.infoIcon} />
          </button>
        )}
      </Tooltip>
    </div>
  );
}
