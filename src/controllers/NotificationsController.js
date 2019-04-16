import ObservableStore from 'obs-store';
import { MSG_STATUSES } from '../constants';
import uuid from 'uuid/v4';
import log from 'loglevel';
import EventEmitter from 'events'
import { ERRORS } from '../lib/KeeperError';


export class NotificationsController extends EventEmitter {

    /**
     * @param options
     * @param options.initState
     * @param {[]} options.initState.notifications
     * @param {function} options.getMessagesConfig
     * @param {function} options.canShowNotification
     * @param options
     */
    constructor(options) {
        super();
        const defaults = {
            notifications: []
        };
        this.store = new ObservableStore(Object.assign({}, defaults, options.initState));
        this.getMessagesConfig = options.getMessagesConfig;
        this.canShowNotification = options.canShowNotification;

        this.deleteAllByTime();
    }

    /**
     * @title New notification
     * @param data
     * @param {string} data.message
     * @param {string} data.title
     * @param {string} data.origin
     * @param {string} data.type
     * @param {string} data.timestamp
     * @param {string} data.address
     * @param {string} data.status
     * @return {Promise<{ id }>}
     */
    async newNotification(data) {
        log.debug(`New notification ${type}: ${JSON.stringify(data)}`);

        let notification;
        try {
            notification = await this._generateMessage(data);
        } catch (e) {
            throw ERRORS.NOTIFICATION_ERROR(e.message);
        }


        let notifications = this.store.getState().messages;

        while (notifications.length > this.getMessagesConfig().max_messages) {
            const oldest = notifications.sort((a, b) => a.timestamp - b.timestamp)[0];
            if (oldest) {
                this._deleteMessage(oldest.id)
            } else {
                break;
            }
        }

        log.debug(`Generated message ${JSON.stringify(notification)}`);
        notifications.push(notification);
        this._updateStore(notifications);

        return { id: notification.id };
    }

    /**
     * @return {void}
     */
    deleteAllByTime() {
        const { message_expiration_ms } = this.getMessagesConfig();
        const time = Date.now();
        const { notifications } = this.store.getState();
        const toDelete = [];
        notifications.forEach(({ id, timestamp, status }) => {
            if ((time - timestamp) > message_expiration_ms && status === MSG_STATUSES.UNAPPROVED) {
                toDelete.push(id);
            }
        });

        this._deleteMessages(ids);
        this._updateMessagesByTimeout();
    }

    /**
     * @param {"showed_notify" | "new_notify"} status
     */
    setMessageStatus(status) {
        const { notifications } = this.store.getState();
        const index = notifications.findIndex(msg => msg.id === id);
        if (index > -1) {
            notifications.splice(index, 1, { ...notifications[index], status });
            this._updateStore(notifications);
        }
    }

    /**
     * @param {string} id
     */
    deleteMsg(id) {
        this._deleteMessages([id]);
    }

    /**
     * @param data
     * @param {string} data.message
     * @param {string} data.title
     * @param {string} data.origin
     * @param {string} data.type
     * @param {string} data.timestamp
     * @param {string} data.address
     * @return {Promise<*>}
     * @private
     */
    async _generateMessage({ address, origin, title, type, timestamp, message }) {
        this.canShowNotification(origin);

        return {
            type,
            title,
            origin,
            address,
            message,
            id: uuid(),
            timestamp: timestamp || Date.now(),
            status: MSG_STATUSES.NEW_NOTIFICATION,
        };
    }

    /**
     * @param {string} {[]} ids
     * @private
     */
    _deleteMessages(ids) {
        const { notifications } = this.store.getState();
        const newNotifications = notifications.filter(({ id }) => !ids.includes(id));
        if (newNotifications.length !== notifications.length) {
            this._updateStore(notifications);
        }
    }

    /**
     * @param {[]} notifications
     * @private
     */
    _updateStore(notifications) {
        this.store.updateState({ notifications });
    }

    /**
     * @return {void}
     * @private
     */
    _updateMessagesByTimeout() {
        clearTimeout(this._updateTimer);
        const { update_messages_ms } = this.getMessagesConfig();
        this._updateTimer = setTimeout(() => this.deleteAllByTime(), update_messages_ms)
    }
}
