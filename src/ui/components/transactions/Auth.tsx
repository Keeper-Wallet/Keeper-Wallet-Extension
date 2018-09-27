import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { getTxId, TxIcon } from './';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { TransactionWallet } from '../wallets';

@translate('extension')
export class Auth extends React.PureComponent {

    readonly props;
    readonly state = Object.create(null);

    constructor(props) {
        super(props);

        getTxId(props.signData).then(
            txId => this.setState({ txId })
        )
    }

    render() {
        const { data: tx } = this.props.signData;

        return <div>
            <div>
                <TransactionWallet account={this.props.selectedAccount}/>
            </div>
            <div>
                <TxIcon txType={this.props.txType}/>
            </div>

            <div>Auth</div>
            <div>data: {tx.data}</div>
            <div>host: {tx.host}</div>
            <div>Tx id = {this.state.txId}</div>
            
            <div>
                <Button type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.auth'>Auth</Trans>
                </Button>
            </div>
        </div>
    }


}
