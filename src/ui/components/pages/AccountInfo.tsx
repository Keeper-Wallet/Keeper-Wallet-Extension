import * as React from 'react';
import { connect } from 'react-redux';
import { Trans, translate } from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import { Avatar, CopyText } from '../ui';

@translate('extension')
class AccountInfoComponent extends React.Component {

    readonly props;

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

                { selectedAccount.prvateKey ? <div>
                    <Trans i18nKey='accountInfo.privKey'>Private key</Trans>
                    <CopyText text={selectedAccount.prvateKey} showCopy={true}/>
                </div> : null}

                {selectedAccount.phrase ? <div>
                    <Trans i18nKey='accountInfo.seed'>Backup phrase</Trans>
                    <CopyText text={selectedAccount.phrase} showCopy={true}/>
                </div> : null}
            </div>
        </div>;
    }
}

const mapStateToProps = function(store: any) {
    return {
        selectedAccount: store.selectedAccount,
        balances: store.balances,
    };
};
export const AccountInfo = connect(mapStateToProps)(AccountInfoComponent);
