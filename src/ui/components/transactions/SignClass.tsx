import * as React from 'react'
import { getTxId } from './';
import { TxIcon } from './TransactionIcon';
import background from '../../services/Background';
import { TransactionWallet } from '../wallets';


export class SignClass extends React.PureComponent {
    
    readonly props;
    readonly state = Object.create(null);
    approveHandler = () => this.approve();
    rejectHandler = () => this.reject();
    bgPromise;
    
    constructor(props) {
        super(props);
        
        getTxId(props.signData).then(
            txId => this.setState({ txId })
        )
    }
    
    render() {
        return <div>
            <div>
                <TransactionWallet account={this.props.selectedAccount}/>
            </div>
            <div>
                <TxIcon txType={this.props.txType}/>
            </div>
        </div>;
    }
    
    approve() {
        this.setState({ inProgress: true });
        this.bgPromise = background.approve(this.props.message.id, this.props.selectedAccount.address)
            .then(
                (approve) => {
                    this.setState({ approve });
                    background.clearMessages();
                },
                        (error) => this.setState({ error })
            );
    }
    
    reject() {
        this.setState({ inProgress: true });
        this.bgPromise = background.reject(this.props.message.id)
            .then(
                (reject) => {
                    this.setState({ reject });
                    background.clearMessages();
                },
                (error) => this.setState({ error }),
            );
    }
}
