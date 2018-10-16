import * as React from 'react';
import { Avatar } from '../ui/avatar/Avatar';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { Button } from '../ui';
import * as styles from './wallet.styl';

const CONF = {

    small: {
        size: 28,
        addClass: ''
    },

    big: {
        size: 48,
        addClass: styles.bigWalet

    }
};

export const TransactionWallet = ({
        className = '',
        onSelect = null,
        onActive = null,
        account = null,
        active = false,
        hideButton = false,
        children = null,
        type = 'small',
        ...props
    }) => {

    const conf = CONF[type] || CONF.small;
    const size = conf.size;
    className = cn(styles.wallet, className, conf.addClass, {[styles.activeWallet]: active});

    const iconClass = cn(styles.accountIcon, 'change-account-icon');

    const clickHandler = () => {
        if (onSelect) {
            onSelect(account);
        }
    };
    const selectHandler = (e) => {
        if (onActive) {
            e.preventDefault();
            e.stopPropagation();
            onActive(account);
        }
    };

    return <div className={`${className} ${styles.inner} ${styles.txWallet} flex`} onClick={clickHandler} {...props}>
        <div className={styles.avatar}>
            <Avatar size={size} address={account.address}/>
        </div>

        <div className={`body3 ${styles.accountData}`}>
            <div className={`${styles.accountName} tag1`}>
                {account.name}
            </div>
            <div className={`basic500 ${styles.accountAddress}`}>
                {account.address}
            </div>
        </div>

        <div className={styles.controls}>
            {children}
            { hideButton ? null :<Button onClick={selectHandler} className={iconClass}></Button> }
        </div>
    </div>;
};
