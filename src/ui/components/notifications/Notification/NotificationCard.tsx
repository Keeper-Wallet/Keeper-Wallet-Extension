import * as styles from './index.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../../ui';
import * as cn from 'classnames';

export class NotificationCard extends React.PureComponent<INotification> {
    deleteHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const ids = this.props.notifications.map(({ id }) => id);
        this.props.deleteNotifications(ids);
    };

    showHandler = (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.props.onShow && this.props.onShow(this.props.notifications);
    };

    render() {
        const { notifications, className: propsClassName, collapsed } = this.props;
        const className = cn(styles.notificationCard, propsClassName);
        const isGroup = notifications.length > 1;
        const title = isGroup ? (
            <span>
                {notifications.length} <Trans i18nKey="notifications.messages">Messages</Trans>
            </span>
        ) : (
            notifications[0].title
        );

        return (
            <div className={cn(className, { [styles.groupTx]: isGroup })}>
                <div className={styles.groupBottom} />
                <div className={styles.groupEffect}>
                    <div className={styles.cardHeader} onClick={this.showHandler}>
                        <div className={styles.messageTransactionIcon}></div>
                        <div className="grow">
                            <div className={`${styles.notififactionEllipsis} basic500 body3 margin-min`}>
                                {notifications[0].origin}
                            </div>
                            <h2 className={`${styles.notififactionEllipsis} headline`}>{title}</h2>
                        </div>
                        {collapsed && (
                            <div>
                                <Button
                                    type={BUTTON_TYPE.TRANSPARENT}
                                    onClick={this.deleteHandler}
                                    className={styles.cardClose}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

interface INotification {
    collapsed?: boolean;
    className?: string;
    deleteNotifications: (ids: [string]) => void;
    onShow?: (item) => void;
    notifications?: any;
}
