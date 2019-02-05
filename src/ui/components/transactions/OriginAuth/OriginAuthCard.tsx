import * as styles from './originAuth.styl';
import * as React from 'react'
import * as cn from 'classnames';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TxIcon } from '../TransactionIcon';
import { messageType } from './parseTx';

@translate(I18N_NAME_SPACE)
export class OriginAuthCard extends React.PureComponent<IOriginAuth> {
    
    render() {
        const { message, collapsed } = this.props;
        const { origin } = message;
        const className = cn(
            styles.originAuthTransactionCard,
            this.props.className,
        );
        
        return <div className={className}>
            <div className={styles.cardHeader}>
                {   collapsed ?
                    <React.Fragment>
                        <div className={styles.smallCardContent}>
                            <div className={styles.originAuthTxIconSmall}>
                                <TxIcon txType={messageType} small={true}/>
                            </div>
                            <div>
                                <div className="basic500 body3 margin-min ellipsis">
                                    {origin}
                                </div>
                                <h1 className="headline1">
                                    <Trans i18nKey='transactions.allowAccessTitle'>Allow access</Trans>
                                </h1>
                            </div>
                        </div>

                    </React.Fragment> :

                    <div className={styles.originAuthTxIcon}>
                        <TxIcon txType={messageType}/>
                    </div>
                }
            </div>
            {
                collapsed ? null :

                    <div className={styles.cardContent}>
                        <div className={styles.originAuthOriginAddress}>{origin}</div>
                        <div className={styles.originAuthOriginDescription}>
                            <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
                        </div>
                    </div>
            }
        </div>
        
    }
}

interface IOriginAuth {
    className: string;
    collapsed: boolean;
    message: any;
}
