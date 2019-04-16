import * as React from 'react';
import { Trans } from 'react-i18next';
import { Copy } from '../ui';
import * as styles from './wallet.styl';
import { WalletItem } from './';
import cn from 'classnames';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


export function ActiveWallet({className = '', leaseBalance, onCopy=null, onShowQr = null, onSelect = null, active, account, balance, ...props}) {

    className = cn(styles.activeWallet, className, { [styles.activeWalletSelected]: active });

    if (!account) {
        return null;
    }

    const walletItemProps = {
        className: 'center',
        account,
        balance,
        leaseBalance,
        active,
        onSelect,
    };

    return <div className={className} {...props}>
        <WalletItem {...walletItemProps} key={account.address}>
            <div className={`${styles.walletIconBlack} ${styles.buttonDefault}`}><Trans i18nKey='ui.wallet'>Wallet</Trans></div>
            <div className={`${styles.transactionsIconBlack} ${styles.buttonDefault}`}><Trans i18nKey='ui.transactions'>Transactions</Trans></div>
            <span className={styles.activeWAlletBtnSeparator}></span>
            <Copy onCopy={onCopy} text={account.address}>
                <div className={`${styles.copyIconBlack} ${styles.button24}`}></div>
            </Copy>
            <div className={`${styles.showQrIcon} ${styles.button24}`} onClick={onShowQr}></div>
        </WalletItem>
    </div>;
}
