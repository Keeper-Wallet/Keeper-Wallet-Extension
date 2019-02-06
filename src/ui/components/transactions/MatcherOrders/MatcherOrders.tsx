import * as styles from './matcher.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { MatcherCard } from './MatcherCard';
import { MatcherInfo } from './MatcherInfo';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';
import { TransactionBottom } from '../TransactionBottom';


@translate(I18N_NAME_SPACE)
export class MatcherOrders extends SignClass {
    
    render() {
        const { message, assets } = this.props;
    
        return <div className={styles.transaction}>
            <div className={`${styles.matcherTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    <Trans i18nKey='transactions.signMatcherRequest'>Sign a request to the Matcher</Trans>
                </div>

                <div className="margin-main">
                    <MatcherCard {...this.props}/>
                </div>
                
                <MatcherInfo message={message} assets={assets}/>
            </div>
    
            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
        </div>
    }
}
