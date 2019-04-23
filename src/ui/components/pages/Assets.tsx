import * as styles from './styles/assets.styl';
import * as React from 'react';
import {connect} from 'react-redux';
import {WalletItem, ActiveWallet} from '../wallets';
import {translate, Trans} from 'react-i18next';
import {
    getBalances,
    getAsset,
    selectAccount,
    setActiveAccount,
} from '../../actions';
import {PAGES} from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal } from '../ui';
import * as CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cn from 'classnames';
import { Intro } from './Intro';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class AssetsComponent extends React.Component {
    props;
    state = {} as any;
    _currentActive;
    _sorted;
    _t;
    addWalletHandler = () => this.props.setTab(PAGES.IMPORT_FROM_ASSETS);
    onSelectHandler = account => this.showInfo(account);
    onSetActiveHandler = account => this.setActive(account);
    copyActiveHandler = () => this.onCopyModal();
    scrollHandler = (e) => {
        const value = e.target.scrollTop;
        this.setState({ topScrollMain: value > 90 });
    };
    showQrHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();
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
            leaseBalance: this.state.lease[activeAddress],
            onSelect: this.onSelectHandler,
            onShowQr: this.showQrHandler,
            active: true,
        };
        
        const wallets = this.getFilteredAndSortedAccounts(activeAddress)
            .map((account) => (
                account ?
                <WalletItem
                    account={account}
                    active={false}
                    balance={this.state.balances[account.address]}
                    leaseBalance={this.state.lease[account.address]}
                    key={`${account.address}_${account.name}_${account.type}`}
                    onSelect={this.onSelectHandler}
                    onActive={this.onSetActiveHandler}/> : null)
            );

        const scrollClassName = cn('scroll-container', {
            'lock-scroll': this.state.topScrollMain
        });

        return <div className={styles.assets}>
            <div className={styles.activeAccountTitle}>
                <Trans i18nKey='assets.activeAccount'>Active account</Trans>
            </div>
            <CSSTransitionGroup className={styles.activeAnimationSpan}
                                transitionName="animate_active_wallet"
                                transitionEnterTimeout={600}
                                transitionEnter={true}
                                transitionLeaveTimeout={600}
                                transitionLeave={true}>
                <ActiveWallet onCopy={this.copyActiveHandler} {...activeProps} key={activeAddress}/>
            </CSSTransitionGroup>

            <div className={`faucet margin-main-big-top`}>
                <div className={`basic500 body3 margin-main`}>
                    <Trans i18nKey='assets.faucet'>Faucet</Trans>
                </div>

                <div className={styles.faucetWrapper}>
                    <div className={`${styles.buttonRequest} black`}>
                        <div className={`tag1`}>
                            <Trans i18nKey='assets.request'>Request</Trans>
                        </div>
                        <div className={`${styles.sum} body1 font600`}>
                            <Trans i18nKey='assets.10waves'>10 WAVES</Trans>
                        </div>
                    </div>
                    <div className={styles.contactRequest}>
                        <div className={`tag1 basic500`}>
                            <Trans i18nKey='assets.problems'>If you experience any problems with the faucet, please contact</Trans>
                        </div>
                        <a className={`${styles.email} tag1 black`}>
                            <Trans i18nKey='assets.email'>support@wavesplatform.com</Trans>
                        </a>
                    </div>
                </div>
            </div>


            <div className={`${scrollClassName} wallets-list`} onScroll={this.scrollHandler}>
                <div>
                    {wallets.length ? <div className={`${styles.otherWalletsTitle} basic500 body3`}>
                        <Trans i18nKey='assets.inStorage'>Other accounts</Trans>
                    </div> : null}
                    
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

                <div className={`body1 basic500 border-dashed ${styles.addAccount}`}
                     onClick={this.addWalletHandler}>
                    <Trans i18nKey='assets.addAccount'>Add an account</Trans>
                </div>
            </div>

            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={this.state.showCopy}
                   showChildrenOnly={true}>
                <div className="modal notification">
                    <Trans i18nKey="assets.copied">Copied!</Trans>
                </div>
            </Modal>

            <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={this.state.showActivated} showChildrenOnly={true}>
                <div className="modal notification active-asset" key={this.state.name}>
                    <div><Trans i18nKey="assets.setActive">Active account changed</Trans></div>
                </div>
            </Modal>
    
            <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={this.state.deletedNotify} showChildrenOnly={true}>
                <div className="modal notification active-asset" key='deleted'>
                    <div><Trans i18nKey="assets.deleteAccount">Delete account</Trans></div>
                </div>
            </Modal>
            
            {/*<div className={styles.notifier}>*/}
                {/*<i className={styles.counter}>5</i>*/}
            {/*</div>*/}
            
        </div>
    }

    getFilteredAndSortedAccounts(activeAddress) {
        if (!activeAddress) {
            return [];
        }
        this._sorted = this._sorted || [];
        const hash = {};
        this.props.accounts.forEach(account => hash[account.address] = account);
        
        this._sorted = this._sorted.map(account => {
            const { address } = account || { address: null };
            const data = hash[address];
            delete hash[address];
            return data;
        }).filter(Boolean);
        delete hash[activeAddress];
        this._sorted = [...this._sorted, ...Object.values(hash).filter(Boolean)];
        
        if (this._currentActive === activeAddress) {
            return this._sorted;
        }
    
        if (!this._currentActive) {
            this._currentActive = activeAddress;
            return this._sorted;
        }
    
        const last = this.props.accounts.find(account => account.address === this._currentActive);
        this._sorted = this._sorted.filter(account => account.address !== activeAddress);
        this._sorted.unshift(last);
        this._currentActive = activeAddress;
        return this._sorted;
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
        const showCopy = false;
        setTimeout(() => this.setState({ showSelected, showActivated, showCopy }), 1000);
    }
    
    onCopyModal() {
        this.setState({ showCopy: true });
        this.closeModals();
    }
    
    static getDerivedStateFromProps(props, state) {
        const asset = props.assets['WAVES'];

        if (!props.activeAccount) {
            return { loading: true };
        }

        if (!asset) {
            props.getAsset('WAVES');
            return { balances: {}, lease: {}, loading: false };
        }
        
        const assetInstance = new Asset(asset);
        const balancesMoney = {};
        const leaseMoney = {};
        
        Object.entries<{ available: string, leasedOut: string }>(props.balances)
            .forEach(([key, balance]) =>  {
                if (!balance) {
                    return null;
                }
            
                balancesMoney[key] = new Money(balance.available, assetInstance);
                leaseMoney[key] = new Money(balance.leasedOut, assetInstance);
            });

        const { deleted: deletedNotify } = props.notifications;
        return { balances: balancesMoney, lease: leaseMoney, loading: false, deletedNotify };
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
        notifications: store.localState.notifications
    };
};

const actions = {
    getAsset,
    getBalances,
    selectAccount,
    setActiveAccount,
};

export const Assets = connect(mapStateToProps, actions)(AssetsComponent);
