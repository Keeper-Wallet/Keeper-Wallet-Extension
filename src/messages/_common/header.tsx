import clsx from 'clsx';
import { type Message } from 'messages/types';
import { type PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';

import * as styles from '../../ui/components/pages/styles/transactions.module.css';
import { MessageWallet } from './wallet';

interface Props {
  message: Message;
  selectedAccount: PreferencesAccount;
}

export function MessageHeader({ message, selectedAccount }: Props) {
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

      <MessageWallet account={selectedAccount} />
    </div>
  );
}
