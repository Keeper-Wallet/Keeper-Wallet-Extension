import * as styles from './alias.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import { I18N_NAME_SPACE } from '../../../appConfig';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';


@translate(I18N_NAME_SPACE)
export class AliasCard extends React.PureComponent<IAlias> {
    
    render() {
        const className = cn(
            styles.aliasCard,
            this.props.className,
            {
                [styles.aliasCard_collapsed]: this.props.collapsed
            }
        );
        
        const { message } = this.props;
        const { data: tx } = message;
        
        return <div className={className}>
            <div className={`${styles.aliasTxIcon} margin-main`}>
                <TxIcon txType={this.props.txType}/>
            </div>
            
            <div className={styles.aliasTitle}></div>
            <div className={styles.aliasInfo}>{tx.data.alias}</div>
            
            <div className={styles.origin}>
                <OriginWarning message={message}/>
            </div>
        </div>
    }
}

interface IAlias {
    className: string;
    collapsed: boolean;
    txType: string;
    message: any;
}
