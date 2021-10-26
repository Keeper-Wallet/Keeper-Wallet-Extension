import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './matcher.styl';

interface IProps {
    message: any;
    assets: any;
}

export class MatcherInfo extends React.PureComponent<IProps> {
    render() {
        const { message } = this.props;
        const { messageHash, data } = message;

        return (
            <div>
                <div className={`${styles.txRow}`}>
                    <div className="tx-title body3 basic500">
                        <Trans i18nKey="transactions.matcherTimeStamp" />
                    </div>
                    <div className={styles.txValue}>{data.data.timestamp}</div>
                </div>

                <div className={styles.txRow}>
                    <div className="tx-title body3 basic500">
                        <Trans i18nKey="transactions.dataHash" />
                    </div>
                    <div className={styles.txValue}>{messageHash}</div>
                </div>
            </div>
        );
    }
}
