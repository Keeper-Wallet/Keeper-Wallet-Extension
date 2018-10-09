import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';

@translate('extension')
export class Auth extends SignClass {

    render() {
        const { data: tx } = this.props.signData;

        return <div className={`${styles.txSign} ${styles.transaction} center`}>

            <div className={styles.txContent}>
                <div className={`${styles.txBigIcon} signin-icon margin-main`}></div>

                <div className="headline2 margin-main">
                    <Trans i18nKey='sign.signAccessWaves'>Sign in with Waves</Trans>
                </div>

                <div className="body3 margin-main-large">
                    <span className={styles.appName}>{tx.host}</span>
                    <span><Trans i18nKey='sign.signAccessHost'>wants to access your Waves Address</Trans></span>
                </div>

                <div className={`${styles.txRow} ${styles.bordered} margin-main-big `}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>

                <div className={`${styles.infoBlock} info-block tag1 basic500 left`}>
                <div>
                    <i className="inactive-account-icon"></i>
                </div>
                <div>
                    <Trans i18nKey='sign.signAccessInfo'>
                        The application will have access your Waves address. It will not get your SEED or Private key.
                        Don't enter your secret phrase (SEED) on websites you will be redirected on.
                    </Trans>
                </div>
            </div>
            </div>
            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
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
