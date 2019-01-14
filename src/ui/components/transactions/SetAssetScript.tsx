import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { SignClass } from './SignClass';
import { TxIcon } from './TransactionIcon';
import { Balance, Button, Copy, DateFormat, Modal } from '../ui';
import { TransactionBottom } from './TransactionBottom';
import cn from 'classnames';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
export class SetAssetScript extends SignClass {
    
    scriptEl: HTMLDivElement;
    readonly state = { showAllScript: false, showCopied: false, showResizeBtn: false };
    _t;
    
    toggleShowScript = () => this.setState({ showAllScript: !this.state.showAllScript });
    onCopy = () => this._onCopy();
    getScriptRef = (ref) => this.scriptEl = ref;
    
    componentDidMount() {
        const scrollHeight = this.scriptEl.scrollHeight;
        const height = this.scriptEl.offsetHeight;
        const showResizeBtn = scrollHeight > height;
        this.setState({ showResizeBtn })
    }
    
    render() {
        const { data: tx } = this.props.signData;
        const showAllClass = cn({
            [styles.showAllScript]: this.state.showAllScript
        });
        
        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>
            
                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>

                <div className="headline2 center margin-main-big">
                    <Trans i18nKey='transactions.setAssetScriptHeader'>Set Asset Script transaction</Trans>
                </div>

                <div className={`plate plate-with-controls break-all ${showAllClass}`}>
                    <div ref={this.getScriptRef} className={`${styles.txValue}`}>{tx.script}</div>
                    <div className="buttons-wrapper">
                        { tx.script ? <Copy text={tx.script} onCopy={this.onCopy}>
                            <Button>
                                <Trans i18nKey='transactions.copy'>Copy</Trans>
                            </Button>
                        </Copy> : null }
                        { this.state.showResizeBtn ? <Button onClick={this.toggleShowScript}>
                            {
                                !this.state.showAllScript ?
                                <Trans i18nKey='transactions.showAll'>Show all</Trans>:
                                <Trans i18nKey='transactions.hide'>Hide</Trans>
                            }
                        </Button>: null }
                    </div>
                </div>
                
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
    
    protected _onCopy() {
        this.setState({ showCopied: true });
        clearTimeout(this._t);
        this._t = setTimeout(() => this.setState({ showCopied: false }), 1000);
    }
}
