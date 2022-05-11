import * as styles from './styles/selectTxAccount.styl';
import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { Button } from '../ui';
import { connect } from 'react-redux';
import {
  clearMessages,
  clearMessagesStatus,
  closeNotificationWindow,
  deleteNotifications,
  reject,
  updateActiveState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { TransactionWallet } from '../wallets/TransactionWallet';
import { Intro } from './Intro';
import { Account } from 'accounts/types';

interface Props {
  selectAccount: Account;
  activeMessage: unknown;
  messages: unknown[];
  activeNotification: unknown;
  notifications: unknown[];

  onBack: () => void;
  setTab: (tab: string) => void;
  updateActiveState: () => void;
  clearMessages: () => void;
  clearMessagesStatus: () => void;
  deleteNotifications: (ids: unknown[]) => void;
  closeNotificationWindow: () => void;
  reject: (id: string) => void;
}

class SelectTxAccountComponent extends React.PureComponent<Props> {
  readonly state = { loading: false };
  readonly props;

  static getDerivedStateFromProps(props, state) {
    const { activeMessage, messages, activeNotification, notifications } =
      props;

    if (
      !activeMessage &&
      messages.length === 0 &&
      !activeNotification &&
      notifications.length === 0
    ) {
      props.setTab(PAGES.ASSETS);
      return { loading: false };
    }

    return state;
  }

  deleteNotifications = () => {
    const ids = this.props.notifications.reduce((acc, item) => {
      return [...acc, ...item.map(({ id }) => id)];
    }, []);
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
          <div className={styles.closeIcon} onClick={this.props.onBack} />
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

const mapStateToProps = state => {
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
  reject,
};

export const SelectTxAccount = connect(
  mapStateToProps,
  actions
)(withTranslation()(SelectTxAccountComponent));
