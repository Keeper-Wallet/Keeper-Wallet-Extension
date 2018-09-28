import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';

@translate('extension')
export class Auth extends SignClass {

    render() {
        const { data: tx } = this.props.signData;

        return <div>
            {super.render()}
            <h1>
                <Trans i18nKey='sign.signAccessWaves'>Sign in with Waves</Trans>
            </h1>
            
            <div>
                <div>{tx.host}</div>
                <Trans i18nKey='sign.signAccessHost'>wants to access your Waves Address</Trans>
            </div>
            
            <div>Tx id = {this.state.txId}</div>
            
            <div>
                <Trans i18nKey='sign.signAccessInfo'>
                    The application will have access your Waves address. It will not get your SEED or Private key.
                    Don't enter your secret phrase (SEED) on websites you will be redirected on.
                </Trans>
            </div>
            
            <div>
                <Button onClick={this.rejectHandler} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button onClick={this.approveHandler} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.auth'>Auth</Trans>
                </Button>
            </div>
        </div>
    }


}
