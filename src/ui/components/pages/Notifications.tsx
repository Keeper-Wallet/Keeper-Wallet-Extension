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
    hasApproved: boolean;
    
    closeHandler = (e) => this.props.closeNotificationWindow();
    
    toListHandler = () => {
    
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
                    <Input id='checkbox_noshow' type={'checkbox'}/>
                    <label htmlFor='checkbox_noshow'>
                        <Trans i18nkey='notifications.allowSending'>Allow sending messages</Trans>
                    </label>
                </div>
                
                <div>
                    <Button type={BUTTON_TYPE.INTERFACE}>
                        <Trans i18nKey='notifications.toListBtn'>Notifications</Trans>
                    </Button>
                    
                    <Button type={BUTTON_TYPE.GENERAL}>
                        <Trans i18nKey='notifications.nextBtn'>Next</Trans>
                    </Button>
    
                    <TransactionWallet onSelect={this.selectAccountHandler} account={this.props.selectedAccount} hideButton={false}/>
                </div>
            </div>
        );
    }
    
    static getDerivedStateFromProps(props, state) {
        
        
        const { messages, activeNotification } = props;
        
        return {
            messages,
            activeNotification,
        };
    }
}

const mapStateToProps = function (store) {
    return {
        selectedAccount: store.selectedAccount,
        activeNotification: store.activeNotification,
        messages: store.messages,
    };
};

const actions = {
    closeNotificationWindow,
};

export const Notifications = connect(mapStateToProps, actions)(NotificationsComponent);
