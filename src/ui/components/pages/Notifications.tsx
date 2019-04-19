import * as React from 'react';
import { connect } from 'react-redux';
import { Input, DateFormat, Button, BUTTON_TYPE } from 'ui/components/ui';
import { translate, Trans } from 'react-i18next';
import {
    updateActiveMessage,
    getAsset,
    approve,
    reject,
    clearMessagesStatus,
    clearMessages,
    closeNotificationWindow,
    setShowNotification,
    setAutoOrigin
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { I18N_NAME_SPACE } from '../../appConfig';
import { TransactionWallet } from '../wallets';
import * as styles from './styles/transactions.styl';


const NotificationItem = ({ notification }) => (
    <div>
        <div>
            <div>{notification && notification.origin}</div>
            <div>{notification && notification.title}</div>
            <pre>{notification && notification.message}</pre>
        </div>
        <div>
            <DateFormat value={notification.timestamp}/>
        </div>
    </div>
);

@translate(I18N_NAME_SPACE)
class NotificationsComponent extends React.Component {
    
    readonly state = {} as any;
    readonly props;
    
    closeHandler = (e) => {
        this._deleteMessages();
        this.props.closeNotificationWindow();
    };
    
    toListHandler = () => {
        this._deleteMessages();
        this.props.setTab(PAGES.MESSAGES_LIST);
    };
    
    toggleCanShowHandler = ( e ) => {
        const canUse = e.target.checked;
        this.props.setShowNotification({ origin: this.state.origin, canUse });
    };
    
    nextHandler = (e) => {
    
    };
    
    selectAccountHandler = () => this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);
    
    componentDidCatch(error, info) {
        this.toListHandler();
    }
    
    render() {
        const { activeNotification } = this.state;
        return (
            <div>
                {
                    activeNotification
                        .map(notification => (
                            <NotificationItem notification={notification} key={notification.id}/>
                        )
                    )
                }
                <div>
                    <Input id='checkbox_noshow' type={'checkbox'} checked={this.state.canShowNotify} onChange={this.toggleCanShowHandler}/>
                    <label htmlFor='checkbox_noshow'>
                        <Trans i18nkey='notifications.allowSending'>Allow sending messages</Trans>
                    </label>
                </div>
                
                <div>
                    {
                        this.state.hasMessages &&
                        <Button type={BUTTON_TYPE.INTERFACE} onClick={this.toListHandler}>
                            <Trans i18nKey='notifications.toListBtn'>Notifications</Trans>
                        </Button>
                    }
                    
                    {
                        this.state.hasNotifications &&
                        <Button type={BUTTON_TYPE.GENERAL} onClick={this.nextHandler}>
                            <Trans i18nKey='notifications.nextBtn'>Next</Trans>
                        </Button>
                    }
                    
                    {
                        this.state.showClose &&
                        <Button type={BUTTON_TYPE.GENERAL} onClick={this.closeHandler}>
                            <Trans i18nKey='notifications.closeBtn'>Close</Trans>
                        </Button>
                    }
                    
                    <TransactionWallet onSelect={this.selectAccountHandler} account={this.props.selectedAccount} hideButton={false}/>
                </div>
            </div>
        );
    }
    
    _deleteMessages() {
    
    }
    
    static getDerivedStateFromProps(props, state) {
        const { origins, activeNotification, messages, notifications } = props;
        const origin = activeNotification[0].origin;
        const perms = origins[origin];
        const canShowNotify = !!perms.find((item) => item && item.type === 'useNotifications');
        const hasMessages =  messages.length > 0;
        const hasNotifications =  notifications.length > 0;
        
        
        return {
            canShowNotify,
            messages,
            activeNotification,
            origin,
            hasMessages,
            hasNotifications,
            showClose: !hasNotifications && !hasMessages
        };
    }
}

const mapStateToProps = function (store) {
    return {
        selectedAccount: store.selectedAccount,
        activeNotification: store.activeNotification,
        origins: store.origins,
        messages: store.messages,
        notifications: store.notifications,
    };
};

const actions = {
    closeNotificationWindow,
    setShowNotification,
};

export const Notifications = connect(mapStateToProps, actions)(NotificationsComponent);
