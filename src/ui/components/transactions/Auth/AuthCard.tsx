import * as styles from './auth.styl';
import * as React from 'react'
import * as cn from 'classnames';
import {translate, Trans} from 'react-i18next';
import {I18N_NAME_SPACE} from '../../../appConfig';


const Icon = (props) => (
    <div className={props.small ? styles.authTxIconSmall : styles.authTxIcon}>
        {
            props.icon ?
                <img className={props.small ? styles.authTxIconSmall : styles.authTxIcon} src={props.icon}/> :
                <div className={cn(
                    'signin-icon', {
                    [styles.authTxIcon]: !props.small,
                    [styles.authTxIconSmall]: props.small,
                    [styles.iconMargin]: !props.small,
                })}/>
        }
    </div>
);


@translate(I18N_NAME_SPACE)
export class AuthCard extends React.PureComponent<IAuth> {

    render() {
        const {message, collapsed} = this.props;
        const {data, origin} = message;
        const tx = {type: data.type, ...data.data};
        const {referrer} = data;
        const {icon, name} = tx;
        const className = cn(
            styles.authTransactionCard,
            this.props.className,
            {
                [styles.authCard_collapsed]: this.props.collapsed
            },
        );

        let myIcon;

        try {
            myIcon = new URL(icon, referrer);
        } catch (e) {
            myIcon = null;
        }

        return <div className={className}>
            <div className={styles.cardHeader}>
                {collapsed ?
                    <React.Fragment>
                        <div className={styles.smallCardContent}>
                            <div className={styles.originAuthTxIconSmall}>
                                <Icon icon={myIcon} small={true}/>
                            </div>
                            <div>
                                <div className="basic500 body3 margin-min ellipsis">
                                    {name || origin}
                                </div>
                                <h1 className="headline1">
                                    <Trans i18nKey='transactions.allowAccessTitle'>Allow access</Trans>
                                </h1>
                            </div>
                        </div>

                    </React.Fragment> :

                    <div className={styles.originAuthTxIcon}>
                        <Icon icon={myIcon}/>
                    </div>
                }
            </div>
            {
                collapsed ?
                    null :

                    <div className={styles.cardContent}>
                        { name ? <div className={styles.originAuthOriginAddress}>{name}</div> : null }
                        <div className={styles.originAuthOriginAddress}>{origin}</div>
                        <div className={styles.originAuthOriginDescription}>
                            <Trans i18nKey='transactions.originWarning'>wants to access your Waves Address</Trans>
                        </div>
                    </div>
            }
        </div>

    }
}

interface IAuth {
    className: string;
    collapsed: boolean;
    message: any;
}
