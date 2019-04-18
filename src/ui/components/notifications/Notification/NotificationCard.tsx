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
                {notifications.length} <Trans i18nKey='notifications.messages'>messages</Trans>
            </span>
        ) : notifications[0].title;
        
        
        return <div className={className}>
            <div>
                <div className={styles.notificationTxIconSmall}>
                    <TxIcon txType={'notification'}/>
                </div>
                <div>{notifications[0].origin}</div>
                <div>{title}</div>
                {
                    collapsed &&
                    <div>
                        <Button type={BUTTON_TYPE.TRANSPARENT} onClick={this.deleteHandler}>X</Button>
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
