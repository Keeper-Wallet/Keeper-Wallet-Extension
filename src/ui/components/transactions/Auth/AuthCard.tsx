import * as styles from './auth.styl';
import * as React from 'react'
import {translate, Trans} from 'react-i18next';
import {I18N_NAME_SPACE} from '../../../appConfig';
import * as cn from 'classnames';

@translate(I18N_NAME_SPACE)
export class AuthCard extends React.PureComponent<IAuth> {

    render() {
        const {message} = this.props;
        const {icon} = message.data.data;
        const {data: tx} = message;
        const className = cn(
              styles.authTransactionCard,
              this.props.className,
            {
                [styles.authCard_collapsed]: this.props.collapsed
            },
        );

        return <div className={className}>
            <div className={styles.cardHeader}>
                <div className={styles.authTxIcon}>
                    {
                        !icon ? <div className={`${styles.txBigIcon} ${styles.iconMargin} signin-icon`}/>
                            :
                            <img className={styles.txBigIcon} src={icon}/>
                    }
                </div>
                <div>
                    <div className="body1 font600 margin-min">TODO --Name--</div>
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.authOriginAddress}>{message.origin}</div>
                <div className={styles.authOriginDescription}>
                    <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
                </div>
            </div>
        </div>

    }
}

interface IAuth {
    className: string;
    collapsed: boolean;
    txType: string;
    message: any;
}
