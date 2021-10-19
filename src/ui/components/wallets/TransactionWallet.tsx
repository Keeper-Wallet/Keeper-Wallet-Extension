import * as React from 'react';
import { Avatar, Button } from '../ui';
import cn from 'classnames';
import * as styles from './wallet.styl';

const CONF = {
    small: {
        size: 28,
        addClass: '',
    },

    clean: {
        size: 28,
        addClass: styles.walletClean,
    },

    big: {
        size: 48,
        addClass: styles.bigWalet,
    },
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
    className = cn(styles.wallet, className, conf.addClass, { [styles.activeWallet]: active });

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

    return (
        <div className={`${className} ${styles.inner} ${styles.txWallet} flex`} {...props}>
            <div className={styles.avatar}>
                <Avatar size={size} address={account.address} />
            </div>

            <div className={`body3 ${styles.accountData}`}>
                <div className={`${styles.accountName} tag1`}>{account.name}</div>
                <div className={`basic500 ${styles.accountAddress}`}>{account.address}</div>
            </div>

            <div className={styles.controls} onClick={clickHandler}>
                {children}
                {hideButton ? null : <Button type="custom" onClick={selectHandler} className={iconClass} />}
            </div>
        </div>
    );
};
