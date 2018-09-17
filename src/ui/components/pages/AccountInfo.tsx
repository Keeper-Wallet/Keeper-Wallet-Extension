import * as React from 'react';
import { connect } from 'react-redux';
import { Trans, translate } from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import { Avatar } from '../ui/avatar/Avatar';

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
                <div>address</div>
                <div>pubKey</div>
                <div>privKey</div>
                <div>backUp</div>
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
