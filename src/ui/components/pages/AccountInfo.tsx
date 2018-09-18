import * as React from 'react';
import { connect } from 'react-redux';
import { Trans, translate } from 'react-i18next';
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

    render () {

        const { selectedAccount } = this.props;
        const balance = this.props.balances[selectedAccount.address];

        return <div className={styles.content}>
           <div>
               <Avatar address={selectedAccount.address} size={50}/>
               <div>
                   <div>{selectedAccount.name}</div>
                   <div>{balance} Waves</div>
               </div>
           </div>
            <div>
                Buttons
            </div>
            <div>
                <div>
                    <Trans i18nKey='accountInfo.address'>Address</Trans>
                    <CopyText text={selectedAccount.address} showCopy={true} showText={true}/>
                </div>

                <div>
                    <Trans i18nKey='accountInfo.pubKey'>Public key</Trans>
                    <CopyText text={selectedAccount.publicKey} showCopy={true} showText={true}/>
                </div>

                { selectedAccount.type === 'seed' ? <div>
                    <Trans i18nKey='accountInfo.privKey'>Private key</Trans>
                    <CopyText getText={this.getPrivate} showCopy={true}/>
                </div> : null}

                {selectedAccount.type === 'seed' ? <div>
                    <Trans i18nKey='accountInfo.seed'>Backup phrase</Trans>
                    <CopyText getText={this.getSeed} showCopy={true}/>
                </div> : null}
            </div>
            <Modal showModal={this.state.showPassword} showChildrenOnly={true}>
                <div>
                    <Input onChange={this.inputPassword}/>
                    <Button onClick={this.confirmPassword}>Enter</Button>
                    <Button onClick={this.rejectPassword}>Cancel</Button>
                </div>
            </Modal>
        </div>;
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

const mapStateToProps = function(store: any) {
    return {
        selectedAccount: store.selectedAccount,
        balances: store.balances,
    };
};
export const AccountInfo = connect(mapStateToProps)(AccountInfoComponent);
