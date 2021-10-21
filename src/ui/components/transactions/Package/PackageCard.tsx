import * as styles from './package.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { getAmounts, getFees, messageType } from './parseTx';
import { Balance } from '../../ui';

const Fees = ({ fees }) => {
    const moneys = Object.values(fees);

    return (
        <div className="margin-main">
            {moneys.map((fee: any) => {
                return (
                    <div key={fee.asset.id}>
                        <Balance balance={fee} isShortFormat={true} showAsset={true} />
                    </div>
                );
            })}
        </div>
    );
};

const Amounts = ({ amounts }) => {
    const moneys = Object.values(amounts);

    return (
        <div>
            {moneys.map(({ amount, sign }, index) => {
                return (
                    <div key={`${index}${amount.asset.id}`}>
                        <Balance balance={amount} split={true} showAsset={true} addSign={`${sign} `} />
                    </div>
                );
            })}
        </div>
    );
};

export class PackageCard extends React.PureComponent<IData> {
    render() {
        const { message, assets, collapsed, className } = this.props;
        const { data = {}, title = '' } = message;
        const tx = [...data];
        const fees = getFees(tx, assets);
        const amounts = getAmounts(tx, assets);
        const myClassName = cn(styles.dataTransactionCard, className, {
            [styles.dataCard_collapsed]: collapsed,
        });

        return (
            <div className={`${myClassName} ${styles.packageTransactionCard} ${styles.groupTx}`}>
                <div className={styles.groupBottom}> </div>
                <div className={styles.groupEffect}>
                    <div className={styles.cardHeader}>
                        <div className={styles.dataTxIcon}>
                            <TxIcon txType={messageType} />
                        </div>

                        <div>
                            <div className="basic500 body3 margin-min">
                                {title && collapsed ? (
                                    title
                                ) : (
                                    <Trans i18nKey="transactions.packTransactionGroup">Group</Trans>
                                )}
                            </div>
                            <h1 className="headline1 margin-main">
                                {tx.length} <Trans i18nKey="transactions.packTransactions">transactions</Trans>
                            </h1>

                            <div className={styles.amounts}>
                                <Amounts amounts={amounts} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.origin}>
                        <div className="basic500 body3 margin-min margin-main-top">
                            <Trans i18nKey="transactions.packTransactionsFees">Fees</Trans>
                        </div>
                        <div className="margin-min">
                            <Fees fees={fees} />
                        </div>
                    </div>

                    <div className={styles.cardContent}>
                        <div className={`${styles.origin} margin-main-top`}>
                            <OriginWarning message={message} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

interface IData {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
