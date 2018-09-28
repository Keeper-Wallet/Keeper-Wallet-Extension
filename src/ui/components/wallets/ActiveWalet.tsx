import * as React from 'react';
import { Trans } from 'react-i18next';
import { Copy } from '../ui';
import * as styles from './wallet.styl';
import { WalletItem } from './';
import cn from 'classnames';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


export function ActiveWallet({className = '', onShowQr = null, onSelect = null, active, account, balance, ...props}) {

    className = cn(styles.activeWallet, className, { [styles.activeWalletSelected]: active });

    if (!account) {
        return null;
    }

    const walletItemProps = {
        className: 'center',
        account,
        balance,
        active,
        onSelect,
    };

    const wallets = [
        <WalletItem {...walletItemProps} key={account.address}>
            <Copy text={account.address}>
                <div className={styles.copyIconBlack}>
                    <Trans i18nKey='ur.copyAddress'>Copy address</Trans>
                </div>
            </Copy>
            <div className={styles.showQrIcon} onClick={onShowQr}>
                <Trans i18nKey='ui.showQR'>Show QR</Trans>
            </div>
        </WalletItem>
    ];

    return <div className={className} {...props}>
        <div className={styles.activeAccountHeader}>
            <Trans i18nKey='ui.activeAccount'>Active account</Trans>
        </div>
        <CSSTransitionGroup transitionName="animate_active"
                            transitionEnterTimeout={600}
                            transitionEnter={true}
                            transitionLeaveTimeout={600}
                            transitionLeave={true}>
            {wallets}
        </CSSTransitionGroup>
    </div>;
}
