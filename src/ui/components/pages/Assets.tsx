import * as styles from './styles/assets.styl';
import * as React from 'react';
import {connect} from 'react-redux';
import {WalletItem, ActiveWallet} from '../wallets';
import {translate, Trans} from 'react-i18next';
import { getBalances, getAsset, selectAccount, setActiveAccount } from '../../actions';
import {PAGES} from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';

@translate('extension')
class AssetsComponent extends React.Component {

    props;
    state = {} as any;
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
            balance: this.state.balances[selectedAddress],
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
                    balance={this.state.balances[account.address]}
                    key={`${account.address}_${account.name}_${account.type}`}
                    onSelect={this.onSelectHandler}
                    onActive={this.onSetActiveHandler}/>)
            );

        return <div className={styles.assets}>

            <ActiveWallet {...activeProps}/>

            <div className={`body1 basic500 border-dashed ${styles.addAccount}`}
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

    static getDerivedStateFromProps(props, state) {
        const asset = props.assets['WAVES'];

        if (!asset) {
            props.getAsset('WAVES');
            return { balances: {} };
        }
        
        const assetInstance = new Asset(asset);
        const balancesMoney = {};
        Object.entries(props.balances)
            .forEach(([key, balance = 0]) =>  balancesMoney[key] = new Money(balance as number, assetInstance));

        return { balances: balancesMoney };
    }
}

const mapStateToProps = function (store: any) {
    const activeAccount = store.selectedAccount.address;
    const selected =  store.localState.assets.account ?  store.localState.assets.account.address : activeAccount;

    return {
        selectedAccount: store.accounts.find(({ address }) => address === selected),
        activeAccount: store.accounts.find(({ address }) => address === activeAccount),
        accounts: store.accounts,
        balances: store.balances,
        assets: store.assets,
    };
};

const actions = {
    getAsset,
    getBalances,
    selectAccount,
    setActiveAccount
};

export const Assets = connect(mapStateToProps, actions)(AssetsComponent);
