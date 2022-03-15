import * as React from 'react';
import { Avatar } from './Avatar';
import * as styles from './avatar.styl';

interface AvatarListItem {
  address: string;
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
        <Avatar
          key={item.address}
          address={item.address}
          selected={selected.address === item.address}
          size={size}
          onClick={() => {
            onSelect(item);
          }}
        />
      ))}
    </div>
  );
}
