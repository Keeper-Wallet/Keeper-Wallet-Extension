import * as styles from './index.styl';
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
export class IssueCard extends React.PureComponent<IIssue> {
    
    render() {
        const className = cn(
            styles.issueTransactionCard,
            this.props.className,
            {
                [styles.issueCard_collapsed]: this.props.collapsed
            },
        );
        
        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const amount = getMoney(getAmount(tx), assets);
        
        return <div className={className}>

            <div className={styles.cardHeader}>
                <div className={styles.issueTxIcon}>
                    <TxIcon txType={messageType}/>
                </div>
                <div>
                    <div className="basic500 body3 margin-min">
                        <Trans i18nKey='transactions.tokenGeneration'>Token Generation</Trans>
                    </div>
                    <h1 className="headline1">
                        <Balance split={true}
                                 showAsset={true}
                                 balance={amount}
                                 className={styles.txBalanceWrapper} 
                        />
                    </h1>
                </div>
            </div>

            <div className={styles.cardContent}>
                <ShowScript script={tx.script} showNotify={true} optional={true} hideScript={this.props.collapsed}/>
                
                <div className={styles.origin}>
                    <OriginWarning message={message}/>
                </div>
            </div>

        </div>
    }
}

interface IIssue {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
