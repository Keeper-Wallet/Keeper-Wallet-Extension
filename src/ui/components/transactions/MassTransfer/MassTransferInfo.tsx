import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import * as styles from './massTransfer.styl';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { Balance, DateFormat, Button, BUTTON_TYPE } from '../../ui';
import { getFee, getAssetsId, getAmount } from './parseTx';
import { getMoney } from '../../../utils/converters';
import { Money } from '@waves/data-entities';

const MIN_COUNT = 3;

const Transfers = ({ transfers, totalAmount, count = MIN_COUNT }) => {
    
    const assets = {[totalAmount.asset.id]: totalAmount.asset};
    
    const data = transfers.slice(0, count).map(
        ({ recipient, amount }) => {
            const money = getMoney(amount, assets);
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
    const needShowBtn = count > MIN_COUNT;
    const showAll = !currentCount || currentCount === MIN_COUNT;
    const newCount = showAll ?  count : MIN_COUNT;
    const toggle = () => onClick(newCount);
    
    if (!needShowBtn) {
        return null;
    }
    
    return  <div className={`${styles.toggleList} margin-main`}>
        <Button onClick={toggle} type={BUTTON_TYPE.TRANSPARENT}>
            {!showAll ?
                <Trans i18nKey='transactions.transfersClose'>Hide</Trans> :
                <div>
                    <Trans i18nKey='transactions.transfersShowAll'>Show All</Trans>
                    <span>({count - MIN_COUNT})</span>
                </div>
            }
        </Button>
    </div>;
};

@translate(I18N_NAME_SPACE)
export class MassTransferInfo extends React.PureComponent<ITransferInfo> {
    
    readonly state = Object.create(null);
    
    toggleShowRecipients = (count) => {
        this.setState({ count });
    };
    
    render() {
        
        const { message, assets } = this.props;
        const { messageHash, data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const fee = getMoney(getFee(tx), assets);
        const amount = getMoney(getAmount(tx), assets);
        
        
        return <div>
            <div>
                <Transfers transfers={tx.transfers}
                           totalAmount={amount}
                           count={this.state.count}/>
        
                <ToggleList count={tx.transfers.length}
                            currentCount={this.state.count}
                            onClick={this.toggleShowRecipients}/>
            </div>
    
            { tx.attachment ? <div className={`${styles.txRow} ${styles.txRowDescription}`}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.description'>Description</Trans>
                </div>
                <div className={`${styles.txValue} plate fullwidth`}>{tx.attachment}</div>
            </div> : null }
    
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.txid'>TXID</Trans>
                </div>
                <div className={styles.txValue}>{messageHash}</div>
            </div>
    
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.fee'>Fee</Trans>
                </div>
                <div className={styles.txValue}><Balance isShortFormat={true} balance={fee} showAsset={true}/></div>
            </div>
    
            <div className={styles.txRow}>
                <div className="tx-title tag1 basic500">
                    <Trans i18nKey='transactions.txTime'>TX Time</Trans>
                </div>
                <div className={styles.txValue}><DateFormat value={tx.timestamp}/></div>
            </div>
        </div>;
    }
}

interface ITransferInfo {
    message: any;
    assets: any;
}
