import * as styles from './auth.styl';
import * as React from 'react'
import * as cn from 'classnames';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';


const Icon = (props) => (
    <div className={styles.authTxIcon}>
        {
            props.icon ?
                <img className={styles.txBigIcon} src={props.icon}/> :
                <div className={cn(styles.txBigIcon, styles.iconMargin, 'signin-icon')}/>
        }
    </div>
);


@translate(I18N_NAME_SPACE)
export class AuthCard extends React.PureComponent<IAuth> {
    
    render() {
        const { message } = this.props;
        const { data, origin } = message;
        const tx = { type: data.type, ...data.data };
        const { referrer } = data;
        const { icon, name } = tx;
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
                <Icon icon={myIcon}/>
                <div>
                    <div className="body1 font600 margin-min">{name}</div>
                </div>
            </div>
            
            <div className={styles.cardContent}>
                <div className={styles.authOriginAddress}>{origin}</div>
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
    message: any;
}
