import * as styles from './../pages/styles/transactions.styl';
import * as React from 'react'
import {translate, Trans} from 'react-i18next';
import {Balance, Button, BUTTON_TYPE} from '../ui';
import {SignClass} from './SignClass';
import { TxIcon } from './TransactionIcon';
import { TransactionBottom } from './TransactionBottom';

const MIN_COUNT = 3;

const Transfers = ({ transfers, totalAmount, count = MIN_COUNT }) => {
    const data = transfers.slice(0, count).map(
        ({ recipient, amount }) => {
            const money = totalAmount.cloneWithTokens(amount);
            return <div key={recipient} className={styles.txRow}>
                <div className="tx-title-black">{recipient}</div>
                <div className='tag1 basic500'>
                    <Balance isShortFormat={true} balance={money}/>
                </div>
            </div>;
        }
    );
    
    return data;
};

const ToggleList = ({ count, currentCount, onClick }) => {
    const showAll = !currentCount || currentCount === MIN_COUNT;
    const newCount = showAll ?  count : MIN_COUNT;
    const toggle = () => onClick(newCount);
    return <Button onClick={toggle} type={BUTTON_TYPE.TRANSPARENT}>
        {!showAll ?
            <Trans i18nKey='transactions.transfersClose'>Hide</Trans> :
            <div><Trans i18nKey='transactions.transfersShowAll'>Show All</Trans><span>({count})</span></div>
        }
    </Button>;
};

@translate('extension')
export class MassTransfer extends SignClass {

    readonly state;
    
    toggleShowRecipients = (count) => {
        this.setState({ count });
    }
    
    render() {
        const {data: tx} = this.props.signData;

        return <div className={styles.transaction}>
            {super.render()}
            <div className={styles.txScrollBox}>

                <div className={`${styles.txIcon} margin-main`}>
                    <TxIcon txType={this.props.txType}/>
                </div>

                <div className={`${styles.txBalance} center headline2`}>
                    <Balance split={true} addSign='- ' showAsset={true} balance={tx.totalAmount}/>
                </div>

                <div>
                    <Transfers transfers={tx.transfers} totalAmount={tx.totalAmount} count={this.state.count}/>
                    <div className={`${styles.toggleList} margin-main`}>
                    <ToggleList count={tx.transfers.length}
                                currentCount={this.state.count}
                                onClick={this.toggleShowRecipients}/>
                    </div>
                </div>

                <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.description'>Description</Trans>
                    </div>
                    <div className={`${styles.txValue} plate fullwidth`}>TROLOLO</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.txid'>TXID</Trans>
                    </div>
                    <div className={styles.txValue}>{this.props.txHash}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title tag1 basic500">
                        <Trans i18nKey='transactions.fee'>Fee</Trans>
                    </div>
                    <div className={styles.txValue}><Balance isShortFormat={true} balance={tx.fee} showAsset={true}/></div>
                </div>
            </div>
    
            <TransactionBottom {...this.props}/>
        </div>
    }
}
