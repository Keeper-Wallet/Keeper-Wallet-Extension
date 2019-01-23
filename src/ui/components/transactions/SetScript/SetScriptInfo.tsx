import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './index.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { Balance, DateFormat } from '../../ui';
import { getFee, getAssetsId, getAmount } from './parseTx';
import { getMoney } from '../../../utils/converters';


@translate(I18N_NAME_SPACE)
export class SetScriptInfo extends React.PureComponent<ISetScriptInfo> {
    
    render() {
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };
        
        const fee = getMoney(getFee(tx), assets);
        return <div>
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
    
            <div className="font600 tag1 basic500 margin-min"><Trans i18nKey='transactions.scriptWarningHeader'>Warning: actions can lead to loss of access to your account</Trans></div>
            <div className="tag1 basic500"><Trans i18nKey='transactions.scriptWarningDescription'>We do not recommend you submit script transactions unless you are an experienced user. Errors can lead to permanent loss of access to your account.</Trans></div>
        </div>;
    }
}

interface ISetScriptInfo {
    message: any;
    assets: any;
}
