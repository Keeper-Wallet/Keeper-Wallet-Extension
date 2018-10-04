import * as React from 'react';
import { Avatar } from '../ui/avatar/Avatar';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { Button } from '../ui';
import * as styles from './wallet.styl';


export const TransactionWallet = ({
        className = '',
        onSelect = null,
        onActive = null,
        account = null,
        active = false,
        children = [],
        ...props
    }) => {

    className = cn(styles.wallet, className, {[styles.activeWallet]: active});

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
            <Avatar size={28} address={account.address}/>
        </div>

        <div className={`body3 ${styles.accountData}`}>
            <div className={styles.accountName}>
                {account.name}
            </div>
            <div className={`${styles.balance} basic500`}>
                {account.address}
            </div>
        </div>

        <div className={styles.controls}>
            {children}
            <Button onClick={selectHandler} className={iconClass}></Button>
        </div>
    </div>;
};
