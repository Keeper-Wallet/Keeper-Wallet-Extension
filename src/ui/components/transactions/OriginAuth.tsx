import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import { I18N_NAME_SPACE } from '../../appConfig';
import { ApproveBtn, Button, BUTTON_TYPE } from '../ui/buttons';
import { OriginWarning } from './OriginWarning';

@translate(I18N_NAME_SPACE)
export class OriginAuth extends SignClass {

    approveHandler = (e) => {
        this.props.approve(e);
    };
    
    render() {
        const { message } = this.props;
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
                <div className={`${styles.txIcon} ${styles.txIconBig} margin-main`}>
                    <TxIcon txType={message.type}/>
                </div>

                <div className="center margin-main-large">
                    <div className="headline2 margin-main">
                        <Trans i18nKey='originAuth.title'>Allow access</Trans>
                    </div>
                    <div>
                        <div className="margin-min body1 font400">{message.origin}</div>
                        <div>
                            <Trans i18nKey='originAuth.description'>wants to access your Waves Address</Trans>
                        </div>
                    </div>
                </div>

                <div className={`${styles.infoBlock} margin-main-large info-block body3 basic500 left`}>
                    <div>
                        <i className="inactive-account-icon"/>
                    </div>
                    <div>
                        <Trans i18nKey='sign.signAccessInfo'>
                            The application will have access to your Waves address but will not expose your SEED or
                            private key.
                            Never enter your secret phrase (SEED) on any website you are redirected to.
                        </Trans>
                    </div>
                </div>
            </div>

            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button onClick={this.props.reject} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='originAuth.block'>Block</Trans>
                </Button>
                <ApproveBtn onClick={this.approveHandler} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='originAuth.allow'>Allow</Trans>
                </ApproveBtn>
        
                <OriginWarning message={message}/>
            </div>
        </div>
    }
}
