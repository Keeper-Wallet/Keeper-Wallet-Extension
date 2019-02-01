import * as styles from './index.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { PackageCard } from './PackageCard';
import { PackageInfo } from './PackageInfo';
import { TransactionBottom } from '../TransactionBottom';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TransactionWallet } from '../../wallets';
import { Button, BUTTON_TYPE } from "../../ui";

@translate(I18N_NAME_SPACE)
export class Package extends SignClass {
    
    render() {
        const { message, assets } = this.props;
        const { title } = message;
        return <div className={styles.transaction}>
            <div className={`${styles.dataTxScrollBox} transactionContent`}>

                <div className="margin-main margin-main-top headline3 basic500">
                    {title ? title : <Trans i18nKey='transactions.confirmationRequest'>Confirmation request</Trans>}
                </div>
                <div className={`${styles.packageTxShadow} margin-main`}>
                    <PackageCard {...this.props}/>
                </div>

                <div className="margin1 headline3 basic500">
                    <Trans i18nKey='transaction.details'>Details</Trans>
                </div>

                <div className={styles.packageInfo}> {/* expandable container */}
                    <PackageInfo message={message} assets={assets}/>
                </div>

                <div className={styles.toggleList}>
                    <div className={styles.icons}>
                        <span className={`${styles.icon} issue-transaction-icon`}></span>
                        <span className={`${styles.icon} data-transaction-icon`}></span>
                        <span className={`${styles.icon} issue-transaction-icon`}></span>
                        <span className={`${styles.icon} data-transaction-icon`}></span>
                        <span className={`${styles.icon} issue-transaction-icon`}></span>
                        <span className={`${styles.icon} data-transaction-icon`}></span>
                        <span className={`${styles.icon} issue-transaction-icon`}></span>
                    </div>
                    <div className={styles.button}>
                        <span>
                            <Trans i18nKey='transactions.hideTransactions'>Hide transactions</Trans> {/* i.arrowUp */}
                            {/* <Trans i18nKey='transactions.hideTransactions'Show transactions</Trans>  --- i.arrowDown  */}
                            <i className={styles.arrowUp}/>
                        </span>
                    </div>
                </div>

            </div>

            <TransactionBottom {...this.props}>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount}/>
            </TransactionBottom>
            
        </div>
    }
}
