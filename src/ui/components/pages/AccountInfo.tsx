import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import { Avatar, CopyText, Modal, Input, Button } from '../ui';
import background from '../../services/Background';

@translate('extension')
class AccountInfoComponent extends React.Component {

    readonly props;
    readonly state = {} as any;
    deffer;
    getSeed = () => this.getAccountInfo('sed');
    getPrivate = () => this.getAccountInfo('privateKey');
    confirmPassword = () => this.deffer.resolve(this.state.password);
    rejectPassword = () => this.deffer.reject();
    inputPassword = (event) => this.setState({ password: event.target.value });

    render() {

        const {selectedAccount} = this.props;
        const balance = this.props.balances[selectedAccount.address];

        return <div className={styles.content}>

            <div className={`flex margin-main-big ${styles.wallet}`}>
                <Avatar className={styles.avatar} address={selectedAccount.address} size={48}/>
                <div className={styles.accountData}>
                    <div>
                        <span className={`basic500 body1 ${styles.accountName}`}>{selectedAccount.name}</span>
                        <i className={styles.editIcon}></i>
                    </div>
                    <div className={`headline1 marginTop1 ${styles.balance}`}>{balance} Waves</div>
                </div>
            </div>

            <div className={`buttons-wrapper margin-main-big ${styles.buttonsWrapper}`}>
                {/* todo @vba / add IF for this button - active now (disabled) or activate onClick (enabled) */}
                <Button disabled={true} className={`margin-main-big ${styles.activeAccount}`} type="interface">
                    <Trans i18nKey='ur.activeNow'>Active now</Trans>
                </Button>
                <Button className={`margin-main-big ${styles.showQrIcon}`} type="interface">
                    <Trans i18nKey='ui.showQR'>Show QR</Trans>
                </Button>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.address'>Your address</Trans>
                </div>
                <div className="input-like tag1">
                    <CopyText text={selectedAccount.address} showCopy={true} showText={true}/>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.pubKey'>Public key</Trans>
                </div>
                <div className="input-like tag1">
                    <CopyText text={selectedAccount.publicKey} showCopy={true} showText={true}/>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.privKey'>Private key</Trans>
                </div>
                <div className="input-like password-input tag1">
                    <CopyText type='key' getText={this.getPrivate} showCopy={true}/>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.backUp'>Backup phrase</Trans>
                </div>
                <div className="input-like password-input tag1">
                    <CopyText type='key' getText={this.getSeed} showCopy={true}/>
                </div>
            </div>

            <Modal showModal={this.state.showPassword} showChildrenOnly={true}>
                <div className="modal">
                    <Input onChange={this.inputPassword}/>
                    <Button onClick={this.confirmPassword}>Enter</Button>
                    <Button onClick={this.rejectPassword}>Cancel</Button>
                </div>
            </Modal>
        </div>
    }

    async getAccountInfo(field) {
        const address = this.props.selectedAccount.address;
        this.setState({ showPassword: true });
        this.deffer = {} as any;
        this.deffer.promise = new Promise((res, rej) => {
            this.deffer.resolve = res;
            this.deffer.reject = rej;
        });

        return this.deffer.promise
            .then((password) => {
                this.setState({ showPassword: false });
                return background.exportAccount(address, password);
            })
            .then(data => {
                debugger;
                return data[field]
            });
    }


}

const mapStateToProps = function (store: any) {
    return {
        selectedAccount: store.selectedAccount,
        balances: store.balances,
    };
};

export const AccountInfo = connect(mapStateToProps)(AccountInfoComponent);
