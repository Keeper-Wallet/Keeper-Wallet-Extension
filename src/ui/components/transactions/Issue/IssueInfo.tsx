import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './index.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { Balance, DateFormat } from '../../ui';
import { getFee, getAssetsId, getAmount } from './parseTx';
import { getMoney } from '../../../utils/converters';


@translate(I18N_NAME_SPACE)
export class IssueInfo extends React.PureComponent<ITransferInfo> {
    
    render() {
        
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };
        
        const fee = getMoney(getFee(tx), assets);
        return <div>
            { tx.description ? <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.description'>Description</Trans>
                </div>
                <div className={`${styles.txValue} plate fullwidth`}>{tx.description}</div>
            </div> : null }
    
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.decimalPoints'>Decimal points</Trans>
                </div>
                <div className={styles.txValue}>{tx.precision}</div>
            </div>
    
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.issureType'>Type</Trans>
                </div>
                <div className={styles.txValue}>{
                    tx.reissuable ?
                        <Trans i18nKey='transactions.reissuable'>Reissuable</Trans>:
                        <Trans i18nKey='transactions.noReissuable'>Not reissuable</Trans>
                }</div>
            </div>
            
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.txid'>TXID</Trans>
                </div>
                <div className={styles.txValue}>{messageHash}</div>
            </div>
        
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.fee'>Fee</Trans>
                </div>
                <div className={styles.txValue}>
                    <Balance isShortFormat={true} balance={fee} showAsset={true}/>
                </div>
            </div>
        
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.txTime'>TX Time</Trans>
                </div>
                <div className={styles.txValue}><DateFormat value={tx.timestamp}/></div>
            </div>
        </div>;
    }
}

interface ITransferInfo {
    message: any;
    assets: any;
}
