import * as React from 'react';
import { Trans } from 'react-i18next';
import { Copy } from '../ui';
import * as styles from './wallet.styl';
import { WalletItem } from './';
import cn from 'classnames';


export function ActiveWallet({className = '', account, balance, ...props}) {

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
        <div>
            <Trans i18nKey='ui.activeAccount'>Active account</Trans>
        </div>
        <WalletItem {...walletItemProps}>
            <Copy text={account.address}>
                <div  className='copy-icon'>
                    <Trans i18nKey='ur.copyAddress'>Copy address</Trans>
                </div>
            </Copy>

            <Trans i18nKey='ui.showQR'>Show QR</Trans>
        </WalletItem>
    </div>;
}



