import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { HeadLogo } from '../head/HeadLogo';
import cn from 'classnames';
import { TransactionWallet } from '../wallets';
import { TxIcon } from './TransactionIcon';
import { getConfigByTransaction } from './';
import { I18N_NAME_SPACE } from '../../appConfig';

const Error = ({approveError}) => {
    return <div>
        <div className="headline2 margin-main-big">
            <Trans i18nKey='sign.someError'>Something went wrong</Trans>
        </div>
        <div className={`plate body3 ${styles.finalTxPlate}`}>{JSON.stringify(approveError.error, null, 4)}</div>
    </div>;
};

@translate(I18N_NAME_SPACE)
export class FinalTransaction extends React.PureComponent {
    readonly props: any;

    render() {
        const { transactionStatus, hasNewMessages, message, selectedAccount, assets } = this.props;
        const isApprove = !!transactionStatus.approveOk;
        const isReject = !!transactionStatus.rejectOk;
        const isError = !!transactionStatus.approveError;
        const signData = this.props.signData;
        const config = this.props.config;
        const FinalComponent = config.final;
        const isSend = message.broadcast;
        const network = selectedAccount && selectedAccount.networkCode;
        const txLink = `https://${ network === 'T' ? 'testnet.' : ''}wavesexplorer.com/tx/${message.messageHash}`;
        const className = cn(styles.txBigIcon, 'margin-main', {
            'tx-reject-icon': isReject,
            'tx-approve-icon': isApprove,
            'tx-error-icon': isError
        });

        return <div className={styles.txFinal}>
            <div className={className}></div>

            <div className={styles.finalTxContent}>
                <div className="margin-main-top center margin-main">
                    {isApprove || isReject ?
                        <FinalComponent hasNewMessages={hasNewMessages} onNext={this.props.onNext} tx={signData} isApprove={isApprove} isReject={isReject} isSend={message.broadcast} message={message} assets={assets}/> : null}
                    {isError ?
                        <div className="headline2"><Error approveError={transactionStatus.approveError}/></div> : null}
                </div>
            </div>
    
            { hasNewMessages ? <div className="margin-main-big">
                <Button  type={BUTTON_TYPE.SUBMIT} onClick={this.props.onNext} className={styles.nextBtn}>
                    <Trans i18nKey='sign.nextTransaction'>Next</Trans>
                </Button>
            </div> : null }
            
            <div className="margin-main-big">
                <Button onClick={this.props.onClick} className={styles.closeBtn}>
                    {isError ? <Trans i18nKey='sign.understand'>I understand</Trans> : null}
                    {isReject || isApprove ? <Trans i18nKey='sign.ok'>Close</Trans> : null}
                </Button>
            </div>
            
            {isSend && isApprove ?
                <div className="center">
                    <a className="link black" href={txLink} target="_blank">
                        <Trans i18nKey='sign.viewTransaction'>View Transaction</Trans>
                    </a>
                </div> : null
            }
        </div>;
    }
}
