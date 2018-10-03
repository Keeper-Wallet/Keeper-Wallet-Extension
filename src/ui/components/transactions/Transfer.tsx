import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Balance, Button, BUTTON_TYPE } from '../ui';
import { SignClass } from './SignClass';

@translate('extension')
export class Transfer extends SignClass {

    render() {
        const { data: tx } = this.props.signData;

        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txBalance}>
                <Balance balance={tx.amount}/>
            </div>
            <div className={styles.txRow}>{tx.recipient}</div>
            <div className={styles.txRow}>Tx id = {this.state.txId}</div>
            <div className={styles.txRow}><Balance balance={tx.fee}/></div>

            <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                <Button onClick={this.rejectHandler} type={BUTTON_TYPE.WARNING}>
                    <Trans i18nKey='sign.reject'>Reject</Trans>
                </Button>
                <Button onClick={this.approveHandler} type={BUTTON_TYPE.SUBMIT}>
                    <Trans i18nKey='sign.approve'>Approve</Trans>
                </Button>
            </div>
        </div>
    }
}
