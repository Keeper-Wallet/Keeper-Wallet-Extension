import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';

@translate('extension')
export class Transfer extends SignClass {

    render() {
        const { data: tx } = this.props.signData;

        return <div>
            {super.render()}
            <div>
                <Balance balance={tx.amount}/>
            </div>
            <div>{tx.recipient}</div>
            <div>Tx id = {this.state.txId}</div>
            <div><Balance balance={tx.fee}/></div>

            <div>
                <Button onClick={this.approveHandler} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button onClick={this.rejectHandler} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.approve'>Approve</Trans>
                </Button>
            </div>
        </div>
    }
}
