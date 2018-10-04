import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { getTxId } from './';
import { TxIcon } from './TransactionIcon';
import { TransactionWallet } from '../wallets';

export class SignClass extends React.PureComponent {
    
    readonly props;
    readonly state = Object.create(null);
    approveHandler = () => this.props.approve();
    rejectHandler = () => this.props.reject();
    
    constructor(props) {
        super(props);
        
        getTxId(props.signData).then(
            txId => this.setState({ txId })
        )
    }
    
    render() {
        return <div>
            <div className="margin-main-big">
                <TransactionWallet account={this.props.selectedAccount}/>
            </div>
            <div className={`${styles.txIcon} margin-main`}>
                <TxIcon txType={this.props.txType}/>
            </div>
        </div>;
    }
}
