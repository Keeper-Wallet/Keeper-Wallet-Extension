import * as React from 'react';
import { Avatar } from './Avatar';
import * as styles from './avatar.styl';
import cn from 'classnames';

export function AvatarList({ className = '', items = [], selected, onSelect, ...props }) {
    const myClassName = cn(styles.avatarList, className);

    return <div className={myClassName}>
        {items.map(item => <Avatar
            key={item.address}
            selected={selected.address === item.address}
            onClick={onSelect && onSelect.bind(null, item)}
            {...{ ...props, ...item }}/>
        )}
    </div>
}
