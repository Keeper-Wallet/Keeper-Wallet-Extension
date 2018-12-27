import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import { Avatar, CopyText, Modal, Input, Error, Button, Balance } from '../ui';
import background from '../../services/Background';
import { getAsset, selectAccount } from '../../actions';
import { Money, Asset } from '@waves/data-entities';
import { PAGES } from '../../pageConfig';
import { Seed } from '@waves/signature-generator';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class AccountInfoComponent extends React.Component {

    readonly props;
    readonly state = { } as any;
    passInputEl: Input;
    copiedTimer;
    deffer;
    getSeed = (cb) => this.getAccountInfo('seed', cb);
    getPrivate = (cb) => this.getAccountInfo('privateKey', cb);
    
    confirmPassword = () => this.deffer.resolve(this.state.password);
    rejectPassword = () => this.deffer.reject();
    inputPassword = (event) => this.setState({ password: event.target.value, passwordError: false });
    setActiveAccount = () => this.props.selectAccount(this.props.selectedAccount);
    editNameHandler = () => this.props.setTab(PAGES.CHANGE_ACCOUNT_NAME);
    showQrHandler = () => this.props.setTab(PAGES.QR_CODE_SELECTED);
    onCopyHandler = () => this.setCopiedModal();
    getInputPassRef = (el) => {
        this.passInputEl = el;
        if (el) {
            this.passInputEl.focus();
        }
    };

    render() {
        const { selectedAccount, activeAccount } = this.props;
        const isActive = selectedAccount.address === activeAccount.address;
        const { onCopyHandler } = this;
        const { leaseBalance } = this.state;
        return <div className={styles.content}>

            <div className={`flex margin-main-big ${styles.wallet}`}>
                <Avatar className={styles.avatar} address={selectedAccount.address} size={48}/>
                <div className={styles.accountData}>
                    <div>
                        <Button type='transparent'
                                className={styles.accountName}
                                onClick={this.editNameHandler} >
                            <span className={`basic500 body1`}>{selectedAccount.name}</span>
                            <i className={styles.editIcon}></i>
                        </Button>
                    </div>
                    <div className={`headline1 marginTop1 ${styles.balance}`}>
                        <Balance split={true} showAsset={true} balance={this.state.balance}/>
                        <div className="basic500 body1">
                            { Number(leaseBalance) ?
                                <span>(<Trans i18nKey='wallet.lease'>Leased</Trans> {leaseBalance.toFormat()})</span>:
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className={`buttons-wrapper margin-main-big ${styles.buttonsWrapper}`}>
                <Button onClick={this.setActiveAccount}
                        disabled={isActive} 
                        className={`margin-main-big ${isActive ? styles.activeAccount : styles.inActiveAccount}`}
                        type="interface">
                    {isActive ? <Trans i18nKey='ur.activeNow'>Active now</Trans> :
                    <Trans i18nKey='ur.unactive'>Make active</Trans>}
                </Button>
                <Button className={`margin-main-big ${styles.showQrIcon}`} type="interface" onClick={this.showQrHandler}>
                    <Trans i18nKey='ui.showQR'>Show QR</Trans>
                </Button>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.address'>Your address</Trans>
                </div>
                <div className="input-like tag1">
                    <CopyText text={selectedAccount.address} showCopy={true} showText={true} onCopy={onCopyHandler}/>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.pubKey'>Public key</Trans>
                </div>
                <div className={`input-like tag1 ${styles.ellipsis}`}>
                    <CopyText text={selectedAccount.publicKey} showCopy={true} showText={true} onCopy={onCopyHandler}/>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.privKey'>Private key</Trans>
                </div>
                <div className="input-like password-input tag1">
                    <CopyText type='key' getText={this.getPrivate} showCopy={true} onCopy={onCopyHandler}/>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.backUp'>Backup phrase</Trans>
                </div>
                <div className="input-like password-input tag1">
                    <CopyText type='key' getText={this.getSeed} showCopy={true} onCopy={onCopyHandler}/>
                </div>
            </div>

            <Modal animation={Modal.ANIMATION.FLASH}
                   showModal={this.state.showPassword}
                   showChildrenOnly={true}>
                <div className={`modal ${styles.enterPasswordModal}`}>
                    <i className={`lock-icon ${styles.lockIcon}`}></i>

                    <div className='margin1 relative'>
                        <div className='basic500 tag1 input-title'>
                            <Trans i18nKey='accountInfo.password'>Password</Trans>
                        </div>
                        <Input ref={this.getInputPassRef}
                               type='password'
                               error={this.state.passwordError}
                               className='margin1'
                               onChange={this.inputPassword}/>

                        <Error show={this.state.passwordError}>
                            <div className='error'>
                                <Trans i18nKey='accountInfo.passwordError'>Incorrect password</Trans>
                            </div>
                        </Error>
                    </div>

                    <Button disabled={this.state.passwordError || !this.state.password}
                            className='margin-main-big' type='submit' 
                            onClick={this.confirmPassword}>
                        <Trans i18nKey='accountInfo.enter'>Enter</Trans>
                    </Button>
                    <Button onClick={this.rejectPassword}>
                        <Trans i18nKey='accountInfo.cancel'>Cancel</Trans>
                    </Button>

                </div>
            </Modal>
            
            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={this.state.showCopied}
                   showChildrenOnly={true}>
                <div className='modal notification'>
                    <Trans i18nKey='accountInfo.copied'>Copied!</Trans>
                </div>
            </Modal>
    
            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={this.state.changeNameNotify}
                   showChildrenOnly={true}>
                <div className="modal notification active-asset" key='change_name'>
                    <div><Trans i18nKey="assets.changeName">Account name changed</Trans></div>
                </div>
            </Modal>
        </div>
    }

    setCopiedModal() {
        clearTimeout(this.copiedTimer);
        this.setState({ showCopied: true });
        this.copiedTimer = setTimeout(() => this.setState({ showCopied: false }), 1000);
    }

    showErrorModal() {
        this.setState({ passwordError: true });
    }

    async getAccountInfo(field, cb) {
        const address = this.props.selectedAccount.address;
        this.deffer = {} as any;
        this.deffer.promise = new Promise((res, rej) => {
            this.deffer.resolve = res;
            this.deffer.reject = rej;
        });
        
        this.setState({ showPassword: true });
    
        this.waitPassword(address)
            .then(this.onGetAccount(field, cb))
            .catch((e) => {
                if (e) {
                    this.setState({ passwordError: true });
                    this.showErrorModal();
                    this.getAccountInfo(field, cb);
                    return null;
                }
    
                this.setState({ showPassword: false, passwordError: false });
            });
    }

    private waitPassword(address) {
        this.deffer.promise = new Promise((res, rej) => {
            this.deffer.resolve = res;
            this.deffer.reject = rej;
        });
        
        return this.deffer.promise
            .then((password) => {
            return background.exportAccount(address, password);
        });
    }
    
    private onGetAccount(field, cb){
        return (data) => {
            this.setState({ showPassword: false, passwordError: false });
            const seed = new Seed(data);
            const info = { address: seed.address, privateKey: seed.keyPair.privateKey, seed: seed.phrase };
            cb(info[field]);
        };
    }
    
    static getDerivedStateFromProps(props, state) {
        const { selectedAccount, assets, balances } = props;
        const asset = assets['WAVES'];

        if (!asset) {
            props.getAsset('WAVES');
            return { balance: null };
        }
        const assetInstance = new Asset(asset);
        const balancesMoney = {};
        const leaseMoney = {};

        Object.entries<{ available: string, leasedOut: string }>(balances)
            .forEach(([key, balance]) =>  {
                if (!balance) {
                    return null;
                }
                
                balancesMoney[key] = new Money(balance.available, assetInstance);
                leaseMoney[key] = new Money(balance.leasedOut, assetInstance);
            });
    
        const { changeName: changeNameNotify } = props.notifications;
        const balance = balancesMoney[selectedAccount.address];
        const leaseBalance = leaseMoney[selectedAccount.address];
        return { balance, leaseBalance, balances: balancesMoney, changeNameNotify };
    }
}

const mapStateToProps = function (store: any) {
    const activeAccount = store.selectedAccount.address;
    const selected =  store.localState.assets.account ?  store.localState.assets.account.address : activeAccount;

    return {
        selectedAccount: store.accounts.find(({ address }) => address === selected),
        activeAccount: store.accounts.find(({ address }) => address === activeAccount),
        balances: store.balances,
        assets: store.assets,
        notifications: store.localState.notifications
    };
};

const actions = {
    getAsset,
    selectAccount
};

export const AccountInfo = connect(mapStateToProps, actions)(AccountInfoComponent);
