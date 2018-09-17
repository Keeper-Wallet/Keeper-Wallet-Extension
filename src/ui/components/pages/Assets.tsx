import * as styles from './styles/assets.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { WalletItem, ActiveWallet } from '../wallets';
import { translate, Trans } from 'react-i18next';
import {setTab, getBalances} from '../../actions';
import { PAGES } from '../../pageConfig';

@translate('extension')
class AssetsComponent extends React.Component {

    props;
    addWalletHandler = () => this.props.setTab(PAGES.IMPORT);
    getBalancesHandler = () => this.props.getBalances();

    render () {

        const { address: selectedAddress} = this.props.selectedAccount;
        const activeProps = {
            account: this.props.selectedAccount,
            balance: this.props.balances[selectedAddress],
        };
        const wallets = this.props.accounts
            .filter(account => account.address !== selectedAddress)
            .map((account) => <WalletItem
                account={account}
                balance={this.getBalance(account.address)}
                key={account.address}/>
            );

        return <div className={styles.assets}>
            <div className={styles.walletBackground}></div>

            <ActiveWallet {...activeProps}/>

            <div className="flex">
                <div>
                    <div className='refresh-icon' onClick={this.getBalancesHandler}></div>
                    <div>
                        <Trans i18nKey='assets.lastUpdate'>Last update:</Trans>
                    </div>
                    <div>time parser</div>
                </div>
                <div className={`${styles.addAccount} border-dashed`} onClick={this.addWalletHandler}>
                    <Trans i18nKey='assets.addAccount'>Add account</Trans>
                </div>
            </div>

            <div>
                <div>
                    <Trans i18nKey='assets.inStorage'>In storage</Trans>
                </div>
                <div>
                    {wallets}
                </div>
            </div>
        </div>
    }

    getBalance(address) {
        return this.props.balances[address];
    }
}

const mapStateToProps = function(store: any) {
    return {
        selectedAccount: store.selectedAccount,
        accounts: store.accounts,
        balances: store.balances,
    };
};

const actions = {
    setTab,
    getBalances
};

export const Assets = connect(mapStateToProps, actions)(AssetsComponent);
