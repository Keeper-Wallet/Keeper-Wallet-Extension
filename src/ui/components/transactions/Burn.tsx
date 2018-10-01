import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';

@translate('extension')
export class Burn extends SignClass {

    render() {
        const { data: tx } = this.props.signData;

        return <div>
            {super.render()}
            <div>Auth</div>
            <div>data: {tx.data}</div>
            <div>host: {tx.host}</div>
            <div>Tx id = {this.state.txId}</div>
            
            <div>
                <Button onClick={this.approveHandler} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button onClick={this.rejectHandler} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.auth'>Auth</Trans>
                </Button>
            </div>
        </div>
    }


}
