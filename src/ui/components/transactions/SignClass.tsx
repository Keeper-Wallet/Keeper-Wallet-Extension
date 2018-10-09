import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { TransactionWallet } from '../wallets';

export class SignClass extends React.PureComponent {
    
    readonly props;
    readonly state = Object.create(null);
    approveHandler = () => this.props.approve();
    rejectHandler = () => this.props.reject();
    selectAccountHandler = () => this.props.selectAccount();

    render() {
        return <div>
            <div>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.selectAccountHandler}/>
            </div>
        </div>;
    }
}
