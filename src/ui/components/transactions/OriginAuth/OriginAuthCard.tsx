import * as styles from './originAuth.styl';
import * as React from 'react'
import * as cn from 'classnames';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TxIcon } from '../TransactionIcon';



@translate(I18N_NAME_SPACE)
export class OriginAuthCard extends React.PureComponent<IOriginAuth> {
    
    render() {
        const { message, txType } = this.props;
        const { origin } = message;
        const className = cn(
            styles.originAuthTransactionCard,
            this.props.className,
            {
                [styles.authCard_collapsed]: this.props.collapsed
            },
        );
        
        return <div className={className}>
            <div className={styles.cardHeader}>
                <div className={styles.originAuthTxIcon}>
                    <TxIcon txType={txType}/>
                </div>
            </div>
            
            <div className={styles.cardContent}>
                <div className={styles.originAuthOriginAddress}>{origin}</div>
                <div className={styles.originAuthOriginDescription}>
                    <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
                </div>
            </div>
        </div>
        
    }
}

interface IOriginAuth {
    className: string;
    collapsed: boolean;
    txType: string;
    message: any;
}
