import * as styles from './index.styl';
import * as React from 'react'
import * as cn from 'classnames';
import { translate, Trans } from 'react-i18next';
import { I18N_NAME_SPACE } from '../../../appConfig';
import { TxIcon } from '../../transactions/TransactionIcon';
import { Button, BUTTON_TYPE } from '../../ui/buttons';

@translate(I18N_NAME_SPACE)
export class NotificationCard extends React.PureComponent<INotification> {
    
    deleteHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const ids = this.props.notifications.map(({ id }) => id);
        this.props.deleteNotifications(ids)
    };
    
    showHandler = () => {
        this.props.onShow && this.props.onShow(this.props.notifications[0].origin)
    };
    
    render() {
        const { notifications, className: propsClassName, collapsed } = this.props;
        const className = cn(
            styles.notificationCard,
            propsClassName,
        );
        const isGroup = notifications.length > 1;
        const title = isGroup ? (
            <span>
                {notifications.length} <Trans i18nKey='notifications.messages'>Messages</Trans>
            </span>
        ) : notifications[0].title;
        
        return <div className={className}>
            <div className={styles.cardHeader}>
                {isGroup ? <div className={styles.notificationTxIconSmall}>
                        <TxIcon txType={'notification'}/>
                    </div> :
                    <div className={styles.messageTransactionIcon}></div>
                }
                <div className="grow">
                    <div className="basic500 body3 margin-min">{notifications[0].origin}</div>
                    <h2 className="headline">{title}</h2>
                </div>
                    {
                        collapsed &&
                        <div>
                            <Button type={BUTTON_TYPE.TRANSPARENT}
                                    onClick={this.deleteHandler}
                                    className={styles.cardClose}
                            ></Button>
                        </div>
                    }
            </div>
        </div>
    }
}

interface INotification {
    collapsed?: boolean;
    className?: string;
    deleteNotifications: (ids: [string]) => void;
    onShow?: (item) => void;
    notifications?: any;
}
