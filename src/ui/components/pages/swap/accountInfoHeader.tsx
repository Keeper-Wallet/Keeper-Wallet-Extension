import { Account } from 'accounts/types';
import * as React from 'react';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import * as styles from './accountInfoHeader.module.css';

interface Props {
  account: Partial<Account>;
}

export function SwapAccountInfoHeader({ account }: Props) {
  return (
    <div className={styles.root}>
      <Avatar address={account.address} type={account.type} size={28} />

      <div className={styles.accountName}>{account.name}</div>
    </div>
  );
}
