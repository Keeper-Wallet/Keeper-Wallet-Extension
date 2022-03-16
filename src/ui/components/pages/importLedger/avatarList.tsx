import cn from 'classnames';
import * as React from 'react';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import * as styles from './avatarList.module.css';
import { Tooltip } from 'ui/components/ui/tooltip';

interface ListItem {
  address: string;
  id: number;
}

interface Props<T extends ListItem> {
  items: T[];
  selected: T;
  size: number;
  onSelect: (account: T) => void;
}

export function LedgerAvatarList<T extends ListItem>({
  items,
  selected,
  size,
  onSelect,
}: Props<T>) {
  return (
    <div className={styles.root}>
      {items.map(item => (
        <div
          key={item.address}
          className={cn(styles.item, {
            [styles.item_selected]: selected.address === item.address,
          })}
          onClick={() => {
            onSelect(item);
          }}
        >
          <Avatar address={item.address} size={size} />

          <Tooltip content={<span>{item.id}</span>}>
            {props => (
              <div className={styles.itemLabel} {...props}>
                {item.id}
              </div>
            )}
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
