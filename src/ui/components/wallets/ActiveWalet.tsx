import * as React from 'react';
import { Trans } from 'react-i18next';
import { Copy } from '../ui';
import * as styles from './wallet.styl';
import { WalletItem } from './';
import cn from 'classnames';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { getExplorerUrls } from '../../utils/waves';

export function ActiveWallet({ className = '', leaseBalance, onCopy = null, onShowQr = null, onSelect = null, active, account, balance, ...props }) {
    
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
    
    const { address, network } = account;
    const { walletLink, activeAddressLink } = getExplorerUrls(network, address);
    
    return <div className={className} {...props}>
        <WalletItem {...walletItemProps} key={account.address}>
            
            {walletLink ? <a href={walletLink}
                             rel="noopener noreferrer"
                             target="_blank"
                             className="walletIconBlack button button-wallet">
                <Trans i18nKey='ui.wallet'>Wallet</Trans></a> : null}
            
            {activeAddressLink ? <a href={activeAddressLink} target="_blank"
                                    rel="noopener noreferrer"
                                    className="transactionsIconBlack button button-wallet">
                <Trans i18nKey='ui.transactions'>Transactions</Trans></a> : null}
            
            <span className={styles.activeWAlletBtnSeparator}></span>
            
            <Copy onCopy={onCopy} text={account.address}>
                <div className="button button-wallet button-wallet-iconOnly copyIconBlack showTooltip"/>
            </Copy>
            <div className={`${styles.walletCopyTooltip} tooltip`}>
                <Trans i18nKey='copyAddress'>Copy address</Trans>
            </div>
            
            <div className="button button-wallet button-wallet-iconOnly showQrIcon showTooltip"
                 onClick={onShowQr}/>
            <div className={`${styles.wallerShowQrTooltip} tooltip`}>
                <Trans i18nKey='showQR'>Show QR</Trans>
            </div>
        
        </WalletItem>
    </div>;
}
