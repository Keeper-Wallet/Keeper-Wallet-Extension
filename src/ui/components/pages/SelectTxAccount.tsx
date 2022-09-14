import * as styles from './styles/selectTxAccount.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button } from '../ui';
import { connect } from 'react-redux';
import {
  clearMessages,
  clearMessagesStatus,
  closeNotificationWindow,
  deleteNotifications,
  navigate,
  reject,
  updateActiveState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { TransactionWallet } from '../wallets/TransactionWallet';
import { Intro } from './Intro';
import { AppState } from 'ui/store';
import { NotificationsStoreItem } from 'notifications/types';
import { PreferencesAccount } from 'preferences/types';
import { MessageStoreItem } from 'messages/types';

interface StateProps {
  selectAccount: Partial<PreferencesAccount>;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
  activeMessage: MessageStoreItem | null;
  activeNotification: NotificationsStoreItem[] | null;
}

interface DispatchProps {
  closeNotificationWindow: () => void;
  navigate: {
    (delta: number): void;
    (page: string | null): void;
  };
  updateActiveState: () => void;
  deleteNotifications: (
    ids:
      | string[]
      | {
          ids: string[];
          next: NotificationsStoreItem[] | null;
        }
  ) => void;
  clearMessagesStatus: () => void;
  clearMessages: () => void;
  reject: (id: string) => void;
}

type Props = WithTranslation & StateProps & DispatchProps;

interface State {
  loading: boolean;
}

class SelectTxAccountComponent extends React.PureComponent<Props, State> {
  state: State = { loading: false };

  static getDerivedStateFromProps(
    props: Readonly<Props>,
    state: State
  ): Partial<State> | null {
    const { activeMessage, messages, activeNotification, notifications } =
      props;

    if (
      !activeMessage &&
      messages.length === 0 &&
      !activeNotification &&
      notifications.length === 0
    ) {
      props.navigate(PAGES.ASSETS);
      return { loading: false };
    }

    return state;
  }

  deleteNotifications = () => {
    const ids = this.props.notifications.reduce((acc, item) => {
      return [...acc, ...item.map(({ id }) => id)];
    }, [] as string[]);
    this.props.deleteNotifications(ids);
  };

  onClick = () => {
    this.props.messages.forEach(({ id }) => this.props.reject(id));
    this.props.clearMessages();
    this.props.clearMessagesStatus();
    this.deleteNotifications();
    this.props.updateActiveState();
    this.setState({ loading: true });
    this.props.closeNotificationWindow();
  };

  render() {
    if (this.state.loading) {
      return <Intro />;
    }

    const { t } = this.props;

    return (
      <div className={styles.content}>
        <TransactionWallet
          className={styles.userWallet}
          hideButton={true}
          account={this.props.selectAccount}
        >
          <div
            className={styles.closeIcon}
            onClick={() => {
              this.props.navigate(-1);
            }}
          />
        </TransactionWallet>
        <div className={styles.wrapper}>
          <div className="title1 margin-main-big">
            {t('sign.changeAccount')}
          </div>

          <div className="margin-main-large body1">
            {t('sign.changeAccountInfo')}
          </div>

          <Button type="submit" view="submit" onClick={this.onClick}>
            {t('sign.switchAccount')}
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    selectAccount: state.selectedAccount,
    messages: state.messages,
    notifications: state.notifications,
    activeMessage: state.activePopup && state.activePopup.msg,
    activeNotification: state.activePopup && state.activePopup.notify,
  };
};

const actions = {
  closeNotificationWindow,
  updateActiveState,
  deleteNotifications,
  clearMessagesStatus,
  clearMessages,
  navigate,
  reject,
};

export const SelectTxAccount = connect(
  mapStateToProps,
  actions
)(withTranslation()(SelectTxAccountComponent));
