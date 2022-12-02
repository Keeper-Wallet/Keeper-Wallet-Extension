import clsx from 'clsx';
import { Avatar } from 'ui/components/ui/avatar/Avatar';
import { Tooltip } from 'ui/components/ui/tooltip';

import * as styles from './avatarList.module.css';

interface ListItem {
  address: string;
  id: number;
}

interface Props {
  selectedId: number;
  size: number;
  users: ListItem[];
  onSelect: (id: number) => void;
}

export function LedgerAvatarList({ selectedId, size, users, onSelect }: Props) {
  return (
    <div className={styles.root}>
      {users.map(item => (
        <div
          key={item.address}
          className={clsx(styles.item, {
            [styles.itemSelected]: selectedId === item.id,
          })}
          onClick={() => {
            onSelect(item.id);
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
