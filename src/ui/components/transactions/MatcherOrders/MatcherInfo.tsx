import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './matcher.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';


@translate(I18N_NAME_SPACE)
export class MatcherInfo extends React.PureComponent<IAuthInfo> {
    
    render() {
        
        const { message } = this.props;
        const { messageHash, data } = message;
        
        return <div>
            <div className={`${styles.txRow}`}>
                
                <div className="tx-title body3 basic500">
                    <Trans i18nKey='transactions.matcherTimeStamp'>Matcher Time Stamp</Trans>
                </div>
                <div className={styles.txValue}>{data.data.timestamp}</div>

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

interface IAuthInfo {
    message: any;
    assets: any;
}
