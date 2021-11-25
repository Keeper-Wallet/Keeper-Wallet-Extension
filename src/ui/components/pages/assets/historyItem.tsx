import cn from 'classnames';
import * as styles from './historyItem.module.css';
import { Balance, Ellipsis, Loader } from '../../ui';
import * as React from 'react';
import { TxIcon } from '../../transactions/BaseTransaction';
import { SIGN_TYPE } from '@waves/signature-adapter';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Trans, useTranslation } from 'react-i18next';
import { Asset, Money } from '@waves/data-entities';
import { getTxLink } from './helpers';
import { getAsset } from '../../../actions';

export function HistoryItem({ tx, className, onClick }) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const address = useAppSelector(state => state.selectedAccount.address);
  const networkCode = useAppSelector(
    state => state.selectedAccount.networkCode
  );
  const assets = useAppSelector(state => state.assets);

  let label, info, messageType;
  let assetId = tx.assetId || 'WAVES';
  let asset = assets[assetId];
  // fetch price asset for exchange transaction
  const priceAssetId = tx.order1?.assetPair?.priceAsset || 'WAVES';
  const priceAsset = assets[priceAssetId];
  React.useEffect(() => {
    if (!priceAsset) {
      dispatch(getAsset(priceAssetId));
    }
  }, []);

  switch (tx.type) {
    case SIGN_TYPE.ISSUE:
      label = t('historyCard.issue');
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          balance={assets && asset && new Money(tx.quantity, new Asset(asset))}
        />
      );
      messageType = 'issue';

      break;
    case SIGN_TYPE.TRANSFER:
      label = t('historyCard.transfer');
      messageType = 'transfer';
      let addSign = '-';

      if (tx.recipient === address) {
        messageType = 'receive';
        label = t('historyCard.receive');
        addSign = '+';
      }

      if (tx.sender === tx.recipient) {
        messageType = 'self-transfer';
        label = t('historyCard.selfTransfer');
        addSign = '';
      }

      info = (
        <Balance
          split
          showAsset
          addSign={addSign}
          assetId={assetId}
          balance={assets && asset && new Money(tx.amount, new Asset(asset))}
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
          balance={assets && asset && new Money(tx.quantity, new Asset(asset))}
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
          balance={assets && asset && new Money(tx.amount, new Asset(asset))}
        />
      );
      messageType = 'burn';
      break;
    case SIGN_TYPE.EXCHANGE:
      messageType = 'create-order';
      assetId = tx.order1.assetPair.amountAsset || 'WAVES';
      asset = assets[assetId];
      label = t('historyCard.exchange', {
        from: asset?.displayName,
        to: priceAsset?.displayName,
      });
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          addSign="+"
          balance={
            assets && asset && new Money(tx.order1.amount, new Asset(asset))
          }
        />
      );
      break;
    case SIGN_TYPE.LEASE:
      label = t('historyCard.lease');
      if (tx.recipient === address) {
        label = t('historyCard.leaseIncoming');
      }
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          balance={assets && asset && new Money(tx.amount, new Asset(asset))}
        />
      );
      messageType = 'lease';
      break;
    case SIGN_TYPE.CANCEL_LEASING:
      label = t('historyCard.leaseCancel');
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          balance={
            assets && asset && new Money(tx.lease.amount, new Asset(asset))
          }
        />
      );
      messageType = 'cancel-leasing';
      break;
    case SIGN_TYPE.CREATE_ALIAS:
      label = t('historyCard.createAlias');
      messageType = 'create-alias';
      break;
    case SIGN_TYPE.MASS_TRANSFER:
      label = t('historyCard.massTransfer');
      info = (
        <Balance
          split
          showAsset
          assetId={assetId}
          addSign="-"
          balance={
            assets && asset && new Money(tx.totalAmount, new Asset(asset))
          }
        />
      );
      messageType = 'mass_transfer';
      break;
    case SIGN_TYPE.DATA:
      label = t('historyCard.dataTransaction');
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
      label = t('historyCard.sponsorshipEnable', { name: asset.displayName });
      messageType = 'sponsor_enable';

      if (!tx.minSponsoredAssetFee) {
        label = t('historyCard.sponsorshipDisable', {
          name: asset.displayName,
        });
        messageType = 'sponsor_disable';
      }
      break;
    case SIGN_TYPE.SET_ASSET_SCRIPT:
      label = t('historyCard.setAssetScript', { name: asset.displayName });
      messageType = 'set-asset-script';
      break;
    case SIGN_TYPE.SCRIPT_INVOCATION:
      label = t('historyCard.scriptInvocation');
      info = <Ellipsis text={tx.dApp} />;
      messageType = 'script_invocation';
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
      <div className={styles.historyIcon}>
        <TxIcon txType={messageType} />
      </div>

      <div className={cn('body1', styles.historyData)}>
        <div
          className={cn(
            !info ? styles.historyLabelOnly : 'basic500',
            styles.historyLabel,
            {}
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
