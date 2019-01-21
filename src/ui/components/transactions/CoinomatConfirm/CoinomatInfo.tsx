import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './coinomat.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { DateFormat } from '../../ui';


@translate(I18N_NAME_SPACE)
export class CoinomatInfo extends React.PureComponent<ICoinomatInfo> {
    
    render() {
        
        const { message } = this.props;
        const { messageHash, data } = message;
        
        return <div>
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.txTime'>TX Time</Trans>
                </div>
                <div className={styles.txValue}><DateFormat value={data.data.timestamp * 1000}/></div>
            </div>
            
            <div className={styles.txRow}>
                <div className="tx-title body3 basic500">
                    <Trans i18nKey='transactions.dataHash'>Data Hash</Trans>
                </div>
                <div className={styles.txValue}>{messageHash}</div>
            </div>
        </div>
    }
}

interface ICoinomatInfo {
    message: any;
    assets: any;
}
