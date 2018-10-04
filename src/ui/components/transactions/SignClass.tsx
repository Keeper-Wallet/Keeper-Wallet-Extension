import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { getTxId } from './';
import { TransactionWallet } from '../wallets';

export class SignClass extends React.PureComponent {
    
    readonly props;
    readonly state = Object.create(null);
    approveHandler = () => this.props.approve();
    rejectHandler = () => this.props.reject();
    selectAccountHandler = () => this.props.selectAccount();
    
    constructor(props) {
        super(props);
        
        getTxId(props.signData).then(
            txId => this.setState({ txId })
        )
    }
    
    render() {
        return <div>
            <div>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.selectAccountHandler}/>
            </div>
        </div>;
    }
}
