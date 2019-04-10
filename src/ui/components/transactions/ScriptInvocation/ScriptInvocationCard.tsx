import * as styles from './scriptInvocation.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import { I18N_NAME_SPACE } from '../../../appConfig';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { Balance, ShowScript } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

@translate(I18N_NAME_SPACE)
export class ScriptInvocationCard extends React.PureComponent<IMassTransfer> {
    
    render() {
        const className = cn(
            styles.scriptInvocationTransactionCard,
            this.props.className,
            {
                [styles.scriptInvocationCard_collapsed]: this.props.collapsed
            },
        );
        
        const { message } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        
        return <div className={className}>
            
            <div className={styles.cardHeader}>
                <div className={styles.scriptInvocationTxIcon}>
                    <TxIcon txType={messageType}/>
                </div>
                <div>
                    <div className="basic500 body3 margin-min">
                        <Trans i18nKey='transactions.scriptInvocation'>Entry in blockchain</Trans>
                    </div>
                    <h1 className="headline1">
                        <Trans i18nKey='transactions.scriptInvocationName'>Script Invocation</Trans>
                    </h1>
                </div>
            </div>
            
            <div className={`${styles.cardContent} marginTop1`}>
                <div className="basic500 body3 margin-min">
                    <Trans i18nKey='transactions.scriptInvocationFunction'>Function</Trans>
                </div>
                <div className="body3 margin-min">{tx.call && tx.call.function || 'Default'}</div>
                <ShowScript className={styles.dataScript}
                            isData={true}
                            noKey={true}
                            data={tx.call.args || []}
                            optional={true}
                            showNotify={true}
                            hideScript={this.props.collapsed}/>

                <div className={`${styles.origin}`}>
                    <OriginWarning message={message}/>
                </div>
            </div>
            
        </div>
    }
}

interface IMassTransfer {
    assets: any;
    className: string;
    collapsed: boolean;
    message: any;
}
