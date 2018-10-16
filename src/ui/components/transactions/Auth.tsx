import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';
import { OriginWarning } from './OriginWarning';

@translate('extension')
export class Auth extends SignClass {

    render() {
        const { data: tx } = this.props.signData;
        const origin = tx.host;
        const warningOrigin = { origin };
        
        return <div className={`${styles.txSign} ${styles.transaction} font400 center`}>
            {super.render()}
            <div className={styles.txScrollBox}>
                {
                    !tx.icon ? <div className={`${styles.txBigIcon} ${styles.iconMargin} signin-icon`}/>
                        :
                        <img className={styles.txBigIcon} src={tx.icon}/>
                }
                <div className="body1 margin-main">
                    <span className={styles.appName}>{tx.name}</span>
                </div>

                <div className="headline2 font600 margin-main-large">
                    <Trans i18nKey='sign.signAccessWaves'>Sign in with Waves</Trans>
                </div>

                <div className={`${styles.txRow} ${styles.borderedBottom} margin-main-big `}>
                    <div className="tx-title body3 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>

                <div className={`${styles.infoBlock} info-block body3 basic500 left`}>
                <div>
                    <i className="inactive-account-icon"/>
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
                <Button onClick={this.props.reject} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button onClick={this.props.approve} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.auth'>Auth</Trans>
                </Button>
    
                <OriginWarning message={warningOrigin}/>
            </div>
        </div>
    }
    
}
