import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { getTxId } from './';
import { Balance, Button, BUTTON_TYPE } from '../ui';

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
            <div>Account info
                {this.props.selectAccount}
            </div>
            <div>Icon-{this.props.txtype}</div>
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
