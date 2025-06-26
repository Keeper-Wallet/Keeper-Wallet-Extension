import { type PreferencesAccount } from 'preferences/types';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { getAccountAvatarAddress } from 'ui/utils/getActiveAccount';

import * as styles from './accountInfoHeader.module.css';

interface Props {
  account: PreferencesAccount | undefined;
}

export function SwapAccountInfoHeader({ account }: Props) {
  return (
    <div className={styles.root}>
      <Avatar
        address={getAccountAvatarAddress(account ?? {} as import('preferences/types').PreferencesAccount) || ''}
        type={account?.accountType === 'waves' ? account.type : undefined}
        size={28}
      />

      <div className={styles.accountName}>{account?.name}</div>
    </div>
  );
}
