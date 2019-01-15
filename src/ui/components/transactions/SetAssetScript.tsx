import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import { Balance, DateFormat, Modal, ShowScript } from '../ui';
import { TransactionBottom } from './TransactionBottom';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
export class SetAssetScript extends SignClass {
    
    render() {
        const { data: tx } = this.props.signData;
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>

                <div className="headline2 center margin-main-big">
                    <Trans i18nKey='transactions.setAssetScriptHeader'>Set Asset Script transaction</Trans>
                </div>
    
                <ShowScript script={tx.script} showNotify={true}/>
                
                <div className={`${styles.txRow} margin-main`}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>
                
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.fee'>Fee</Trans>
                    </div>
                    <div className={styles.txValue}>
                        <Balance balance={tx.fee} isShortFormat={true} showAsset={true}/>
                    </div>
                </div>
    
                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txTime'>TX Time</Trans>
                    </div>
                    <div className={styles.txValue}><DateFormat value={tx.timestamp}/></div>
                </div>
                
                <div className="font600 tag1 basic500 margin-main-min"><Trans i18nKey='transactions.assetScriptWarningHeader'>Warning: actions can block transactions with your asset</Trans></div>
                <div className="tag1 basic500"><Trans i18nKey='transactions.assetScriptWarningDescription'>We do not recommend you submit script transactions unless you are an experienced user.</Trans></div>

            </div>
    
            <TransactionBottom {...this.props}/>
    
            <Modal animation={Modal.ANIMATION.FLASH_SCALE}
                   showModal={this.state.showCopied}
                   showChildrenOnly={true}>
                <div className='modal notification'>
                    <Trans i18nKey='transactions.copied'>Copied!</Trans>
                </div>
            </Modal>
        </div>
    }
}
