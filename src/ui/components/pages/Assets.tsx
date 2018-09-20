import * as styles from './styles/assets.styl';
import * as React from 'react';
import {connect} from 'react-redux';
import {WalletItem, ActiveWallet} from '../wallets';
import {translate, Trans} from 'react-i18next';
import { getBalances, selectAccount, setActiveAccount } from '../../actions';
import {PAGES} from '../../pageConfig';

@translate('extension')
class AssetsComponent extends React.Component {

    props;
    addWalletHandler = () => this.props.setTab(PAGES.IMPORT_FROM_ASSETS);
    getBalancesHandler = () => this.props.getBalances();
    onSelectHandler = account => this.props.setActiveAccount(account);
    onSetActiveHandler = account => this.props.selectAccount(account);
    showQrHandler = (event) => {
        event.stopPropagation();
        this.props.setTab(PAGES.QR_CODE_SELECTED);
    };
    
    render() {

        const {address: activeAddress} = this.props.activeAccount;
        const {address: selectedAddress} = this.props.selectedAccount;

        const activeProps = {
            account: this.props.selectedAccount,
            balance: this.props.balances[selectedAddress],
            onClick: () => this.props.setTab(PAGES.ACCOUNT_INFO),
            onShowQr: this.showQrHandler,
            active: activeAddress === selectedAddress,
        };

        const wallets = this.props.accounts
            .filter(account => account.address !== selectedAddress)
            .map((account) => (
                <WalletItem
                    account={account}
                    active={activeAddress === account.address}
                    balance={this.getBalance(account.address)}
                    key={`${account.address}_${account.name}_${account.type}`}
                    onSelect={this.onSelectHandler}/>)
            );

        return <div className={styles.assets}>

            <ActiveWallet {...activeProps}/>

            <div className={`margin4 body1 basic500 border-dashed ${styles.addAccount}`}
                 onClick={this.addWalletHandler}>
                <Trans i18nKey='assets.addAccount'>Add an account</Trans>
            </div>

            <div>
                <div className="basic500 body1">
                    <Trans i18nKey='assets.inStorage'>In storage</Trans>
                </div>
                <div className={styles.walletsList}>
                    {wallets}
                </div>
            </div>
        </div>
    }

    getBalance(address) {
        return this.props.balances[address];
    }
}

const mapStateToProps = function (store: any) {
    return {
        activeAccount: store.selectedAccount,
        accounts: store.accounts,
        balances: store.balances,
        selectedAccount: store.localState.assets.account || store.selectedAccount
    };
};

const actions = {
    getBalances,
    selectAccount,
    setActiveAccount
};

export const Assets = connect(mapStateToProps, actions)(AssetsComponent);
