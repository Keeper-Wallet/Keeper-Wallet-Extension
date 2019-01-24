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

const Error = ({ approveError }) => {
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
        const {
            transactionStatus,
            selectedAccount,
            messages,
            message,
            onClose,
            onNext,
            onList,
            assets,
        } = this.props;
        
        const newMessages = (messages
            .map(item => item.id)
            .filter(id => id !== message.id)
            .length);
        
        const isSend = message.broadcast;
        const isApprove = !!transactionStatus.approveOk;
        const isReject = !!transactionStatus.rejectOk;
        const isError = !!transactionStatus.approveError;
        const isShowNext = newMessages > 0;
        const isShowList = newMessages > 1;
        const isShowClose = newMessages.length === 0;
        const config = this.props.config;
        const FinalComponent = config.final;
        const Card = config.card;
        const network = selectedAccount && selectedAccount.networkCode;
        const txLink = `https://${network === 'T' ? 'testnet.' : ''}wavesexplorer.com/tx/${message.messageHash}`;
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
                        <FinalComponent isApprove={isApprove} isReject={isReject} isSend={message.broadcast}
                                        message={message} assets={assets}/> : null}
                    {isError ?
                        <div className="headline2"><Error approveError={transactionStatus.approveError}/></div> : null}
                </div>
                <Card message={message} assets={assets} collapsed={false}/>
            </div>
            
            {isShowNext ? <div className="margin-main-big">
                <Button type={BUTTON_TYPE.SUBMIT} onClick={onNext} className={styles.nextBtn}>
                    <Trans i18nKey='sign.nextTransaction'>Next</Trans>
                </Button>
            </div> : null}
            
            {isShowList ? <div className="margin-main-big">
                <Button type={BUTTON_TYPE.SUBMIT} onClick={onList} className={styles.closeBtn}>
                    <Trans i18nKey='sign.pendingList'>Pending list</Trans>
                </Button>
            </div> : null}
            
            {isShowClose ? <div className="margin-main-big">
                <Button onClick={onClose} className={styles.closeBtn}>
                    {isError ? <Trans i18nKey='sign.understand'>I understand</Trans> : null}
                    {isReject || isApprove ? <Trans i18nKey='sign.ok'>Close</Trans> : null}
                </Button>
            </div> : null}
            
            {isSend && isApprove ?
                <div className="center">
                    <a className="link black" href={txLink} target="_blank">
                        <Trans i18nKey='sign.viewTransaction'>View Transaction</Trans>
                    </a>
                </div> : null}
            <TransactionWallet account={this.props.selectedAccount} hideButton={true}/>
        </div>;
    }
}
