import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import {translate, Trans} from 'react-i18next';
import {Button, BUTTON_TYPE} from '../ui';
import {HeadLogo} from '../head/HeadLogo';
import cn from 'classnames';
import {TransactionWallet} from '../wallets';
import {TxIcon} from './TransactionIcon';

const Error = ({approveError}) => {
    return <div>
        <div className="headline2 margin-main-big">
            <Trans i18nKey='sign.someError'>Something went wrong</Trans>
        </div>
        <div className={`plate body3 ${styles.finalTxPlate}`}>{JSON.stringify(approveError.error, null, 4)}</div>
    </div>;
};

@translate('extension')
export class FinalTransaction extends React.PureComponent {
    readonly props;

    render() {
        const {transactionStatus} = this.props;
        const isApprove = !!transactionStatus.approveOk;
        const isReject = !!transactionStatus.rejectOk;
        const isError = !!transactionStatus.approveError;
        const message = transactionStatus.approveOk && transactionStatus.approveOk.message || {};
        const isSend = message.broadcast;
        const network = message.account && message.account.networkCode;
        const txLink = `https://${ network === 'T' ? 'testnet.' : ''}wavesexplorer.com/tx/${message.messageHash}`;
        const className = cn(styles.txBigIcon, 'margin-main', {
            'tx-reject-icon': isReject,
            'tx-approve-icon': isApprove,
            'tx-error-icon': isError
        });

        return <div className={styles.txFinal}>
            <HeadLogo/>
            <div className={className}></div>

            <div className={styles.finalTxContent}>
                <div className="margin-main-top center margin-main">
                    {isApprove ?
                        <div className="margin-main-large headline2"><Trans i18nKey='sign.approved'>Your transaction is
                            approved!</Trans></div> : null}
                    {isReject ?
                        <div className="margin-main-large headline2"><Trans i18nKey='sign.rejected'>Your transaction is
                            rejected!</Trans></div> : null}
                    {isError ?
                        <div className="headline2"><Error approveError={transactionStatus.approveError}/></div> : null}
                </div>

                {isError ? null :
                    <TransactionWallet type='big' account={this.props.selectedAccount} hideButton={true}/>}
                {isError ? null : <div className={styles.txInfoRow}>
                    <TxIcon className={styles.icon} txType={this.props.txType}/>
                    <div className={styles.data}>
                        <div className="body1">
                            <Trans i18nKey='transactions.txid'>TXID</Trans>
                        </div>
                        <div className="basic500 tag1">9PCjZftzzhtY4ZLLBfsyvNxw8RwAgXZVZJX</div>
                    </div>
                </div>}
            </div>

            <div className="margin-main-big">
                <Button type={BUTTON_TYPE.SUBMIT} onClick={this.props.onClick}>
                    {isError ? <Trans i18nKey='sign.understand'>I understand</Trans> : null}
                    {isReject || isApprove ? <Trans i18nKey='sign.ok'>Okay</Trans> : null}
                </Button>
            </div>

            {isSend ?
                <div className="center">
                    <a className="link black" href={txLink} target="_blank">
                        <Trans i18nKey='sign.viewTransaction'>View Transaction</Trans>
                    </a>
                </div> : null
            }
        </div>;
    }
}
