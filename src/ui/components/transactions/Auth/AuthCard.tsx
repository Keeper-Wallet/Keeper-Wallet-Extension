import * as styles from './auth.styl';
import * as React from 'react'
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';
import * as cn from 'classnames';
import { OriginWarning } from '../OriginWarning';

@translate(I18N_NAME_SPACE)
export class AuthCard extends React.PureComponent<IAUth> {
    
    render() {
        const { message } = this.props;
        const { icon } = message.data.data;
        const { data: tx } = message;
        const className = cn(
            styles.authTransactionCard,
            this.props.className,
            {
                [styles.authCard_collapsed]: this.props.collapsed
            },
        );
        
        return <div className={className}>
            <div className={styles.cardHeaderColumn}>
                <div className={styles.authTxIcon}>
                    {
                        !icon ? <div className={`${styles.txBigIcon} ${styles.iconMargin} signin-icon`}/>
                            :
                            <img className={styles.txBigIcon} src={icon}/>
                    }
                </div>
                <div>
                    <div className="basic500 body3 margin-min">
                        <Trans i18nKey='sign.signAccessWaves'>Sign in with Waves</Trans>
                    </div>
                    <h1 className="headline1">{tx.name}</h1>
                </div>
            </div>

            <div className={styles.cardContentColumn}>
                <div className={styles.origin}>
                    <OriginWarning message={message}/>
                </div>
            </div>

        </div>
    }
}

interface IAUth {
    className: string;
    collapsed: boolean;
    txType: string;
    message: any;
}
