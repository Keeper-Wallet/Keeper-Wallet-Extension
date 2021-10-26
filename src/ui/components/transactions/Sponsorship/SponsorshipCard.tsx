import * as styles from './sponsorship.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Asset, Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAssetFee, SPONSOR_MODE } from './parseTx';

interface IProps {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}

export class SponsorshipCard extends React.PureComponent<IProps> {
    render() {
        const className = cn(styles.sponsorshipTransactionCard, this.props.className, {
            [styles.sponsorshipCard_collapsed]: this.props.collapsed,
        });

        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const assetFee = getMoney(getAssetFee(tx), assets);
        const isSetSponsored = assetFee.getTokens().gt(0);

        return (
            <div className={className}>
                <div className={styles.cardHeader}>
                    <div className={styles.sponsorshipTxIcon}>
                        <TxIcon txType={isSetSponsored ? SPONSOR_MODE.enable : SPONSOR_MODE.disable} />
                    </div>
                    <div>
                        <div className="basic500 body3 margin-min">
                            <Trans
                                i18nKey={isSetSponsored ? 'transactions.setSponsored' : 'transactions.clearSponsored'}
                            />
                        </div>
                        <h1 className="headline1">
                            {isSetSponsored ? (
                                <Balance
                                    split={true}
                                    showAsset={true}
                                    balance={assetFee}
                                    className={styles.txBalanceWrapper}
                                />
                            ) : (
                                <Asset assetId={assetFee.asset.id} />
                            )}
                        </h1>
                    </div>
                </div>

                <div className={styles.cardContent}>
                    {isSetSponsored ? (
                        <div className={styles.txRow}>
                            <div className="tx-title tag1 basic500">
                                <Trans i18nKey="transactions.amountPerTransaction" />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
