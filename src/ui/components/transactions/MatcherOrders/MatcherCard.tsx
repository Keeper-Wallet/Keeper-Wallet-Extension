import * as styles from './matcher.styl';
import * as React from 'react';
import cn from 'classnames';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import { messageType } from './parseTx';

interface IProps {
    className: string;
    collapsed: boolean;

    message: any;
}

export class MatcherCard extends React.PureComponent<IProps> {
    render() {
        const { message, collapsed } = this.props;
        const { origin } = message;
        const className = cn(styles.matcherTransactionCard, this.props.className, {
            [styles.matcherCard_collapsed]: this.props.collapsed,
        });

        return (
            <div className={className}>
                <div className={styles.matcherHeader}>
                    {collapsed ? (
                        <React.Fragment>
                            <div className={styles.smallCardContent}>
                                <div className={styles.matcherTxIconSmall}>
                                    <TxIcon txType={messageType} small={true} />
                                </div>
                                <div>
                                    <div className="basic500 body3 margin-min origin-ellipsis">{origin}</div>
                                    <h1 className="headline1">
                                        <Trans i18nKey="transactions.signRequestMatcher" />
                                    </h1>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <div className={styles.matcherTxIcon}>
                            <TxIcon txType={messageType} />
                        </div>
                    )}
                </div>
                {collapsed ? null : <div className={styles.cardContent} />}
            </div>
        );
    }
}
