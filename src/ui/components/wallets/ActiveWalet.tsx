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
    
    let walletLink;
    let activeAddressLink;

    (function() {
        if (account.network == 'mainnet') {
            walletLink = 'https://client.wavesplatform.com/import/waveskeeper';
            activeAddressLink = 'https://wavesexplorer.com/address/' + account.address;
        } else if  (account.network == 'testnet') {
            walletLink = 'https://testnet.wavesplatform.com/import/waveskeeper'
            activeAddressLink = false;
        } else {
            walletLink = false;
            activeAddressLink = false;
        };
    })();
    
    return <div className={className} {...props}>
        <WalletItem {...walletItemProps} key={account.address}>
            
            {walletLink ? <a href={walletLink}
               target="_blank"
               className="walletIconBlack button button-wallet">
               <Trans i18nKey='ui.wallet'>Wallet</Trans></a> : null}
            
            {activeAddressLink ? <a href={activeAddressLink} target="_blank"
               className="transactionsIconBlack button button-wallet">
               <Trans i18nKey='ui.transactions'>Transactions</Trans></a> : null}
            
            <span className={styles.activeWAlletBtnSeparator}></span>
            
            <Copy onCopy={onCopy} text={account.address}>
                <div className="button button-wallet button-wallet-iconOnly copyIconBlack showTooltip"></div>
            </Copy>
            <div className={`${styles.walletCopyTooltip} tooltip`}>
                <Trans i18nKey='copyAddress'>Copy address</Trans>
            </div>
            
            <div className="button button-wallet button-wallet-iconOnly showQrIcon showTooltip"
                 onClick={onShowQr}></div>
            <div className={`${styles.wallerShowQrTooltip} tooltip`}>
                <Trans i18nKey='showQR'>Show QR</Trans>
            </div>
            
        </WalletItem>
    </div>;
}
