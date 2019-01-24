import * as styles from './index.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { TxIcon } from '../TransactionIcon';
import { I18N_NAME_SPACE } from '../../../appConfig';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';
import { Asset } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAssetFee, SPONSOR_MODE } from './parseTx';

@translate(I18N_NAME_SPACE)
export class SponsorshipCard extends React.PureComponent<IIssue> {
    
    render() {
        const className = cn(
            styles.sponsorshipTransactionCard,
            this.props.className,
            {
                [styles.sponsorshipCard_collapsed]: this.props.collapsed
            },
        );
        
        const { message, assets } = this.props;
        const { data = {} } = message;
        const tx = { type: data.type, ...data.data };
        const assetFee = getMoney(getAssetFee(tx), assets);
        const isSetSponsored = assetFee.getTokens().gt(0);
        const conf = {
            key: isSetSponsored ? 'setSponsored' : 'clearSponsored',
            title: isSetSponsored ? 'Set Sponsorship' : 'Disable Sponsorship',
            icon: isSetSponsored ? SPONSOR_MODE.enable : SPONSOR_MODE.disable,
        };
        
        
        return <div className={className}>

            <div className={styles.cardHeader}>
                <div className={styles.sponsorshipTxIcon}>
                    <TxIcon txType={conf.icon}/>
                </div>
                <div>
                    <div className="basic500 body3 margin-min">
                        <Trans i18nKey={`transactions.${conf.key}`}>{conf.title}</Trans>
                    </div>
                    <h1 className="headline1">
                        <Asset assetId={assetFee.asset.id}/>
                    </h1>
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.origin}>
                    <OriginWarning message={message}/>
                </div>
            </div>

        </div>
    }
}

interface IIssue {
    assets: any;
    className?: string;
    collapsed: boolean;
    message: any;
}
