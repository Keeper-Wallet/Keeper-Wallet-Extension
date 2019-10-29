import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './wavesAuth.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { DateFormat } from '../../ui';


@translate(I18N_NAME_SPACE)
export class WavesAuthInfo extends React.PureComponent<IWavesAuthInfo> {
    
    render() {
        
        const { message } = this.props;
        const { messageHash, data } = message;
        
        return <div>
            <div className={styles.txRow}>
                
                <div className="tx-title body3 basic500">
                    <Trans i18nKey='transactions.wavesAuthTimeStamp'>Time Stamp</Trans>
                </div>
                <div className={'fullwidth'}><DateFormat value={data.timestamp} showRaw={true} className={'fullwidth'}/></div>

            </div>
            <div className={styles.txRow}>
                <div className="tx-title body3 basic500">
                    <Trans i18nKey='transactions.publicKey'>Public Key</Trans>
                </div>
                <div className={styles.txValue}>{data.publicKey}</div>
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

interface IWavesAuthInfo {
    message: any;
    assets: any;
}
