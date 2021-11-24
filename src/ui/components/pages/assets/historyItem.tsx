import cn from 'classnames';
import * as styles from './historyItem.module.css';
import { Balance, Ellipsis, Loader } from '../../ui';
import * as React from 'react';
import { TxIcon } from '../../transactions/BaseTransaction';
import { SIGN_TYPE } from '@waves/signature-adapter';
import { useAppSelector } from '../../../store';
import { Trans } from 'react-i18next';
import { Asset, Money } from '@waves/data-entities';

export function HistoryItem({ tx, className, onClick }) {
  const address = useAppSelector(state => state.selectedAccount.address);
  const assets = useAppSelector(state => state.assets);

  let label, info, messageType;
  let assetId = tx.assetId || 'WAVES';
  let asset = assets[assetId];

  switch (tx.type) {
    case SIGN_TYPE.ISSUE:
      label = <Trans i18nKey="history.assetGeneration">Asset Generation</Trans>;
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
      label = <Trans i18nKey="history.transfer" />;
      messageType = 'transfer';
      let addSign = '-';

      if (tx.recipient === address) {
        messageType = 'receive';
        label = <Trans i18nKey="history.receive" />;
        addSign = '+';
      }

      if (tx.sender === tx.recipient) {
        messageType = 'self-transfer';
        label = <Trans i18nKey="history.selfTransfer" />;
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
      label = <Trans i18nKey="history.reissue" />;
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
      label = <Trans i18nKey="history.burn" />;
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
    case SIGN_TYPE.LEASE:
      label = <Trans i18nKey="history.lease" />;
      if (tx.recipient === address) {
        label = <Trans i18nKey="history.leaseIncoming" />;
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
      label = <Trans i18nKey="history.leaseCancel" />;
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
      label = <Trans i18nKey="history.createAlias" />;
      messageType = 'create-alias';
      break;
    case SIGN_TYPE.MASS_TRANSFER:
      label = <Trans i18nKey="history.massTransfer" />;
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
      label = <Trans i18nKey="history.dataTransaction" />;
      messageType = 'data';
      break;
    case SIGN_TYPE.SET_SCRIPT:
      label = <Trans i18nKey="history.setScript" />;
      messageType = 'set-script';

      if (!tx.script) {
        label = <Trans i18nKey="history.setScriptCancel" />;
        messageType = 'set-script-cancel';
      }

      break;
    case SIGN_TYPE.SPONSORSHIP:
      label = (
        <Trans
          i18nKey="history.sponsorshipEnable"
          values={{ name: asset.displayName }}
        />
      );
      messageType = 'sponsor_enable';

      if (!tx.minSponsoredAssetFee) {
        label = (
          <Trans
            i18nKey="history.sponsorshipDisable"
            values={{ name: asset.displayName }}
          />
        );
        messageType = 'sponsor_disable';
      }
      break;
    case SIGN_TYPE.SET_ASSET_SCRIPT:
      label = (
        <Trans
          i18nKey="history.setAssetScript"
          values={{ name: asset.displayName }}
        />
      );
      messageType = 'set-asset-script';
      break;
    case SIGN_TYPE.SCRIPT_INVOCATION:
      label = <Trans i18nKey="history.scriptInvocation" />;
      info = <Ellipsis text={tx.dApp} />;
      messageType = 'script_invocation';
      break;
    case SIGN_TYPE.CREATE_ORDER:
      messageType = 'create-order';
      break;
    case SIGN_TYPE.CANCEL_ORDER:
      messageType = 'cancel-order';
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
        >
          {!asset ? <Loader /> : label || tx.id}
        </div>
        <div className={styles.historyBalance}>{info}</div>
      </div>
    </div>
  );
}
