import * as styles from './coinomat.styl';
import * as React from 'react'
import * as cn from 'classnames';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TxIcon } from '../TransactionIcon';
import { messageType } from './parseTx';

@translate(I18N_NAME_SPACE)
export class CoinomatCard extends React.PureComponent<IMatcher> {
    
    render() {
        const { message } = this.props;
        const { data, origin } = message;
        const tx = { type: data.type, ...data.data };
        const className = cn(
            styles.coinomatTransactionCard,
            this.props.className,
            {
                [styles.matcherCard_collapsed]: this.props.collapsed
            },
        );
        
        return <div className={className}>
            <div className={styles.matcherHeader}>
                <div className={styles.matcherTxIcon}>
                    <TxIcon txType={messageType}/>
                </div>
            </div>
            
            <div className={styles.cardContent}>
                <div className={styles.matcherOriginAddress}>{origin}</div>
                <div className={styles.matcherOriginDescription}>
                    <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
                </div>
            </div>
        </div>
        
    }
}

interface IMatcher {
    className: string;
    collapsed: boolean;
  
    message: any;
}
