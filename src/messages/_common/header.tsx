import clsx from 'clsx';
import { Message } from 'messages/types';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as styles from '../../ui/components/pages/styles/transactions.module.css';
import { TransactionWallet } from '../../ui/components/wallets/TransactionWallet';

export function MessageHeader({
  hideButton,
  message,
  selectAccount,
  selectedAccount,
}: {
  hideButton?: boolean;
  message: Message;
  selectAccount?: (account: PreferencesAccount) => void;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.txHeader}>
      <div className="margin-main margin-main-top flex basic500">
        {message.origin && (
          <>
            <div className={clsx(styles.originAddress, 'flex')}>
              {message.origin}
            </div>

            <div className="flex" data-testid="originNetwork">
              <i className={clsx(styles.originNetworkIcon, 'networkIcon')} />
              {t(`bottom.${message.account.network}`)}
            </div>
          </>
        )}
      </div>

      <TransactionWallet
        account={selectedAccount}
        hideButton={hideButton}
        type="clean"
        onSelect={selectAccount}
      />
    </div>
  );
}
