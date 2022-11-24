import cn from 'classnames';
import { NotificationsStoreItem } from 'notifications/types';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { Button } from '../../ui';
import * as styles from './index.styl';

class NotificationCardComponent extends PureComponent<INotification> {
  deleteHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const ids = this.props.notifications.map(({ id }) => id);
    this.props.deleteNotifications(ids);
  };

  showHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    this.props.onShow && this.props.onShow(this.props.notifications);
  };

  render() {
    const {
      t,
      notifications,
      className: propsClassName,
      collapsed,
    } = this.props;
    const className = cn(styles.notificationCard, propsClassName);
    const isGroup = notifications.length > 1;
    const title = isGroup ? (
      <span>
        {notifications.length} {t('notifications.messages')}
      </span>
    ) : (
      notifications[0].title
    );

    return (
      <div className={cn(className, { [styles.groupTx]: isGroup })}>
        <div className={styles.groupBottom} />
        <div className={styles.groupEffect}>
          <div className={styles.cardHeader} onClick={this.showHandler}>
            <div className={styles.messageTransactionIcon} />
            <div className="grow">
              <div
                className={`${styles.notififactionEllipsis} basic500 body3 margin-min`}
              >
                {notifications[0].origin}
              </div>
              <h2 className={`${styles.notififactionEllipsis} headline`}>
                {title}
              </h2>
            </div>
            {collapsed && (
              <div>
                <Button
                  type="button"
                  view="transparent"
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

interface INotification extends WithTranslation {
  collapsed?: boolean;
  className?: string;
  deleteNotifications: (ids: string[]) => void;
  onShow?: (item: NotificationsStoreItem[] | null) => void;
  notifications: NotificationsStoreItem[];
}

export const NotificationCard = withTranslation()(NotificationCardComponent);
