import * as React from 'react';
import { Avatar } from '../ui/avatar/Avatar';
import { Trans } from 'react-i18next';
import cn from 'classnames';
import { Balance, Button } from '../ui';
import * as styles from './wallet.styl';


export const WalletItem = ({
        className = '',
        onSelect = null,
        onActive = null,
        account = null,
        active = false,
        balance = null,
        leaseBalance = null,
        children = [],
        ...props
    }) => {

    className = cn(styles.wallet, className, {[styles.activeWallet]: active});

    const iconClass = cn(
        styles.accountIcon,
        {
            'active-account-icon': active,
            'inactive-account-icon': !active,
        });

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

    return <div className={`${className} ${styles.inner} flex`} onClick={clickHandler} {...props}>
        <div className={styles.avatar}>
            <Avatar size={40} address={account.address}/>
        </div>

        <div className={`body1 ${styles.accountData}`}>
            <div className={`basic500 ${styles.accountName}`}>
                {account.name}
            </div>
            <div className={styles.balance}>
                <Balance isShortFormat={false} split={true} showAsset={true} balance={balance}/>
            </div>
        </div>

        <div className={styles.controls}>
            {children}
            <div onClick={selectHandler} className={iconClass}></div>
            <div className={`${styles.accountIconTooltip} tooltip`}>
                <Trans i18nKey='wallet.tooltip.makeActive'>Make active</Trans>
            </div>
        </div>
    </div>;
};
