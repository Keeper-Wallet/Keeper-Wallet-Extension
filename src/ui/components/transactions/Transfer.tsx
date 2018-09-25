import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { getTxId, TxIcon } from './';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { TransactionWallet } from '../wallets';

@translate('extension')
export class Transfer extends React.PureComponent {

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
            <div>
                <Balance balance={tx.amount}/>
            </div>
            <div>{tx.recipient}</div>
            <div>Tx id = {this.state.txId}</div>
            <div><Balance balance={tx.fee}/></div>

            <div>
                <Button type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.approve'>Approve</Trans>
                </Button>
            </div>
        </div>
    }


}
