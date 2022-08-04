import { TransactionWallet } from '../../wallets/TransactionWallet';
import * as styles from '../../pages/styles/transactions.styl';
import * as React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { PreferencesAccount } from 'preferences/types';
import { MessageStoreItem } from 'messages/types';

const OriginWarning = ({ message }: { message: MessageStoreItem }) => {
  const { t } = useTranslation();

  if (!message.origin && !message.account?.network) {
    return null;
  }

  return (
    <>
      <div className={cn(styles.originAddress, 'flex')}>{message.origin}</div>
      <div className={cn(styles.originNetwork, 'flex')}>
        <i className={cn(styles.originNetworkIcon, 'networkIcon')}> </i>
        <span>{t(`bottom.${message?.account?.network}`)}</span>
      </div>
    </>
  );
};

export function TxHeader({
  selectedAccount,
  selectAccount,
  message,
  hideButton = false,
}: {
  selectedAccount?: Partial<PreferencesAccount>;
  message?: MessageStoreItem;
  hideButton?: boolean;
  selectAccount?: (account: Partial<PreferencesAccount>) => void;
}) {
  return (
    <div className={styles.txHeader}>
      <div className="margin-main margin-main-top flex basic500">
        <OriginWarning
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          message={message!}
        />
      </div>

      <TransactionWallet
        type="clean"
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        account={selectedAccount!}
        hideButton={hideButton}
        onSelect={selectAccount}
      />
    </div>
  );
}
