import * as React from 'react'
import { getTxId, TxIcon } from './';
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
        this.bgPromise = background.approve(this.props.mesasge.id, this.props.selectedAccount.address)
            .then(
                (approve) => this.setState({ approve }),
                (error) => this.setState({ error }),
            );
    }
    
    reject() {
        this.setState({ inProgress: true });
        this.bgPromise = background.reject(this.props.mesasge.id)
            .then(
                (reject) => this.setState({ reject }),
                (error) => this.setState({ error }),
            );
    }
}
