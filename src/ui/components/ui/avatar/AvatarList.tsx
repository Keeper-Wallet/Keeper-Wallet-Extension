import cn from 'classnames';

import { Avatar } from './Avatar';
import * as styles from './AvatarList.module.css';

interface AvatarListItem {
  address: string | null;
}

interface Props<T extends AvatarListItem> {
  items: T[];
  selected: T;
  size: number;
  onSelect: (account: T) => void;
}

export function AvatarList<T extends AvatarListItem>({
  items,
  selected,
  size,
  onSelect,
}: Props<T>) {
  return (
    <div className={styles.avatarList}>
      {items.map(item => (
        <div
          key={item.address}
          className={cn(styles.avatarListItem, {
            [styles.avatarListItemSelected]: selected.address === item.address,
          })}
          onClick={() => {
            onSelect(item);
          }}
        >
          <Avatar address={item.address} size={size} />
        </div>
      ))}
    </div>
  );
}
