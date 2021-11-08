import { TransactionWallet } from '../../wallets';
import * as styles from '../../pages/styles/transactions.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';

const OriginWarning = ({ message }) => {
  if (!message.origin) {
    return null;
  }

  return (
    <>
      <div className={cn(styles.originAddress, 'flex')}>{message.origin}</div>
      <div className={cn(styles.originNetwork, 'flex')}>
        <i className={cn(styles.originNetworkIcon, 'networkIcon')}> </i>
        <span className={styles.networkBottom}>
          <Trans i18nKey={`bottom.${message?.account?.network}`} />
        </span>
      </div>
    </>
  );
};

export function TxHeader({
  selectedAccount,
  selectAccount,
  message,
  hideButton = false,
}) {
  return (
    <div className={styles.txHeader}>
      <div className="margin-main margin-main-top flex basic500">
        <OriginWarning message={message} />
      </div>

      <TransactionWallet
        type="clean"
        account={selectedAccount}
        hideButton={hideButton}
        onSelect={selectAccount}
      />
    </div>
  );
}
