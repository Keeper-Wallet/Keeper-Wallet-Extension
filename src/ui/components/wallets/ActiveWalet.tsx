import * as React from 'react';
import { Trans } from 'react-i18next';
import { Copy } from '../ui';
import * as styles from './wallet.styl';
import { WalletItem } from './';
import cn from 'classnames';

export function ActiveWallet({className = '', onShowQr=null, account, balance, ...props}) {

    className = cn(styles.activeWallet, className);

    if (!account) {
        return null;
    }

    const walletItemProps = {
        className: 'center',
        active: true,
        account,
        balance,
    };

    return <div className={className} {...props}>
        <div className={styles.activeAccountHeader}>
            <Trans i18nKey='ui.activeAccount'>Active account</Trans>
        </div>
        <WalletItem {...walletItemProps}>
            <Copy text={account.address}>
                <div className={styles.copyIconBlack}>
                    <Trans i18nKey='ur.copyAddress'>Copy address</Trans>
                </div>
            </Copy>
            <div className={styles.showQrIcon} onClick={onShowQr}>
                <Trans i18nKey='ui.showQR'>Show QR</Trans>
            </div>
        </WalletItem>
    </div>;
}
