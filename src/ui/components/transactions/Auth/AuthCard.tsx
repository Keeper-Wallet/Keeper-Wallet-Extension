import * as styles from './auth.styl';
import * as React from 'react'
import * as cn from 'classnames';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';


const Icon = (props) => (
    <div className={styles.authTxIcon}>
        {
            props.canUseIcon ?
                <img className={styles.txBigIcon} src={props.icon}/> :
                <div className={cn(styles.txBigIcon, styles.iconMargin, 'signin-icon')}/>
        }
    </div>
);


@translate(I18N_NAME_SPACE)
export class AuthCard extends React.PureComponent<IAuth> {
    
    readonly state = { canUseIcon: false, icon: null };
    
    componentDidMount(): void {
        const { message } = this.props;
        const { data } = message;
        const tx = data.data;
        let icon;
    
        try {
            icon = new URL(tx.icon, data.referrer).href;
        } catch (e) {
            icon = null;
        }
        
        const img = document.createElement('image');
        
        img.onload = () => this.setState({ icon, canUseIcon: true });
    }
    
    render() {
        const { canUseIcon, icon } = this.state;
        const { message } = this.props;
        const { data, origin } = message;
        const tx = { type: data.type, ...data.data };
        const { name } = tx;
        const className = cn(
            styles.authTransactionCard,
            this.props.className,
            {
                [styles.authCard_collapsed]: this.props.collapsed
            },
        );
        
        return <div className={className}>
            <div className={styles.cardHeader}>
                <Icon icon={icon} canUseIcon={canUseIcon}/>
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
