import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui';
import { HeadLogo } from '../head/HeadLogo';
import cn from 'classnames';
import { TransactionWallet } from '../wallets';
import { getConfigByTransaction } from './index';
import { TxIcon } from './TransactionIcon';

const Error = ({ approveError }) => {
    return <div>
        <div className="headline2 margin-main-big">
            <Trans i18nKey='sign.someError'>Something went wrong</Trans>
        </div>
        <div className="plate body3">{JSON.stringify(approveError.error, null, 4)}</div>
    </div>;
};

@translate('extension')
export class FinalTransaction extends React.PureComponent {
    readonly props;
    
    render() {
        const { transactionStatus } = this.props;
        const isApprove = !!transactionStatus.approveOk;
        const isReject = !!transactionStatus.rejectOk;
        const isError = !!transactionStatus.approveError;
        const message = transactionStatus.approveOk && transactionStatus.approveOk.message || {};
        const isSend = message.broadcast;
        const network = message.account && message.account.networkCode;
        const txLink = `https://${ network === 'T' ? 'testnet' : 'mainet'}.wavesexplorer.com/tx/${message.messageHash}`;
        const className = cn(styles.txBigIcon, 'margin-main', {
            'tx-reject-icon':  isReject,
            'tx-approve-icon': isApprove,
            'tx-error-icon': isError
        });
        
        return <div className={`${styles.txFinal} center`}>
            <HeadLogo/>
            <div className={className}></div>
            <div className="headline2 margin-main-top margin-main">
                {isApprove ? <Trans i18nKey='sign.approved'>Your transaction is approved!</Trans> : null}
                {isReject ? <Trans i18nKey='sign.rejected'>Your transaction is rejected!</Trans> : null}
                {isError ? <div><Error approveError={transactionStatus.approveError}/></div> : null}
            </div>
    
            <TransactionWallet account={this.props.selectedAccount} hideButton={true}/>
            
            <div className={`${styles.txIcon} margin-main`}>
                <TxIcon txType={this.props.txType}/>
            </div>
            
            {isSend ?
                <a className="link" href={txLink} target="_blank">
                    <Trans i18nKey='sign.viewTransaction'>View Transaction</Trans>
                </a> : null
            }
            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.props.onClick}>
                {isError ? <Trans i18nKey='sign.action'>Action</Trans> : null}
                {isReject || isApprove ? <Trans i18nKey='sign.ok'>Okay</Trans> : null}
            </Button>
        </div>;
    }
}
