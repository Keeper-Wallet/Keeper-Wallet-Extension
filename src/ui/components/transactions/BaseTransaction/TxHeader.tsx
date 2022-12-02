import clsx from 'clsx';
import { MessageStoreItem } from 'messages/types';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as styles from '../../pages/styles/transactions.styl';
import { TransactionWallet } from '../../wallets/TransactionWallet';

const OriginWarning = ({ message }: { message: MessageStoreItem }) => {
  const { t } = useTranslation();

  if (!message.origin && !message.account?.network) {
    return null;
  }

  return (
    <>
      <div className={clsx(styles.originAddress, 'flex')}>{message.origin}</div>
      <div className={clsx(styles.originNetwork, 'flex')}>
        <i className={clsx(styles.originNetworkIcon, 'networkIcon')}> </i>
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
  selectedAccount: PreferencesAccount;
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
        account={selectedAccount}
        hideButton={hideButton}
        onSelect={selectAccount}
      />
    </div>
  );
}
