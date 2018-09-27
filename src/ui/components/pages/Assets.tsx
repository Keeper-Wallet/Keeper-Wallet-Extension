import * as styles from './styles/assets.styl';
import * as React from 'react';
import {connect} from 'react-redux';
import {WalletItem, ActiveWallet} from '../wallets';
import {translate, Trans} from 'react-i18next';
import { getBalances, getAsset, selectAccount, setActiveAccount } from '../../actions';
import {PAGES} from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal } from '../ui';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cn from 'classnames';
import { Intro } from './Intro';

@translate('extension')
class AssetsComponent extends React.Component {

    props;
    state = {} as any;
    addWalletHandler = () => this.props.setTab(PAGES.IMPORT_FROM_ASSETS);
    onSelectHandler = account => this.showInfo(account);
    onSetActiveHandler = account => this.setActive(account);
    scrollHandler = (e) => {
        const value = e.target.scrollTop;
        this.setState({ topScrollMain: value > 90 });
    };
    showQrHandler = (event) => {
        event.stopPropagation();
        this.props.setTab(PAGES.QR_CODE_SELECTED);
    };

    render() {

        if (this.state.loading) {
            return <Intro/>;
        }

        const {address: activeAddress} = this.props.activeAccount;

        const activeProps = {
            account: this.props.activeAccount,
            balance: this.state.balances[activeAddress],
            onClick: () => this.showInfo(this.props.activeAccount),
            onShowQr: this.showQrHandler,
            active: true,
        };

        const wallets = this.props.accounts
            .filter(account => account.address !== activeAddress)
            .map((account) => (
                <WalletItem
                    account={account}
                    active={false}
                    balance={this.state.balances[account.address]}
                    key={`${account.address}_${account.name}_${account.type}`}
                    onSelect={this.onSelectHandler}
                    onActive={this.onSetActiveHandler}/>)
            );

        const scrollClassName = cn('scroll-container', {
            'lock-scroll': this.state.topScrollMain
        });

        return <div className={styles.assets}>
            <ActiveWallet {...activeProps} key={activeAddress}/>

            <div className={`${scrollClassName} wallets-list`} onScroll={this.scrollHandler}>
                <div className={`body1 basic500 border-dashed ${styles.addAccount}`}
                     onClick={this.addWalletHandler}>
                    <Trans i18nKey='assets.addAccount'>Add an account</Trans>
                </div>
                <div>
                    {/* todo @vba remove inStorage div if no account there */}
                    <div className="basic500 body1 in-storage">
                        <Trans i18nKey='assets.inStorage'>In storage</Trans>
                    </div>
                    <div className={styles.walletListWrapper}>
                        <CSSTransitionGroup transitionName="animate_wallets"
                                            transitionEnterTimeout={600}
                                            transitionEnter={true}
                                            transitionLeaveTimeout={600}
                                            transitionLeave={true}>
                            {wallets}
                        </CSSTransitionGroup>
                    </div>
                </div>
            </div>

            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={this.state.showCopied}
                   showChildrenOnly={true}>
                <div className="modal notification">
                    <Trans i18nKey="assets.copied">Copied!</Trans>
                </div>
            </Modal>

            <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={this.state.showActivated} showChildrenOnly={true}>
                <div className="modal notification active-asset" key={this.state.name}>
                    <div><Trans i18nKey="assets.account">Account</Trans></div>
                    <div><span> {this.state.name} </span></div>
                    <div><Trans i18nKey="assets.setActive">set active!</Trans></div>
                </div>
            </Modal>

        </div>
    }

    setActive(account) {
        this.props.selectAccount(account);
        this.setState({ showActivated: true, name: account.name });
        this.closeModals();
    }

    showInfo(account) {
        this.props.setActiveAccount(account);
        this.props.setTab(PAGES.ACCOUNT_INFO);
    }

    closeModals() {
        const showSelected = false;
        const showActivated = false;
        setTimeout(() => this.setState({ showSelected, showActivated }), 1000);
    }

    static getDerivedStateFromProps(props, state) {
        const asset = props.assets['WAVES'];

        if (!props.activeAccount) {
            return { loading: true };
        }

        if (!asset) {
            props.getAsset('WAVES');
            return { balances: {}, loading: false };
        }
        
        const assetInstance = new Asset(asset);
        const balancesMoney = {};
        Object.entries(props.balances)
            .forEach(([key, balance = 0]) =>  balancesMoney[key] = new Money(balance as number, assetInstance));

        return { balances: balancesMoney, loading: false };
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
