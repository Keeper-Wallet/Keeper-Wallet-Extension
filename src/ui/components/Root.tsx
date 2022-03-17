import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { addBackTab, loading, removeBackTab, setTab } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';

const NO_USER_START_PAGE = PAGES.WELCOME;
const USER_START_PAGE = PAGES.LOGIN;

class RootComponent extends React.Component {
  props: IProps;
  state = { tab: null, loading: true };

  constructor(props: IProps) {
    super(props);
    setTimeout(() => props.setLoading(false), 200);
  }

  static getDerivedStateFromProps(nextProps: IProps, state) {
    /**
     * Loading page
     */
    if (nextProps.loading) {
      return { tab: PAGES.INTRO };
    }

    let tab = nextProps.tab;

    /**
     * Intro page on load
     */
    if (!tab && nextProps.locked == null) {
      tab = PAGES.INTRO;
    }

    /**
     * Has notify - show confirm page
     */
    const { messages, notifications, activePopup, accounts } = nextProps;

    if (
      !nextProps.locked &&
      tab !== PAGES.CHANGE_TX_ACCOUNT &&
      accounts.length
    ) {
      if (activePopup && activePopup.msg) {
        tab = PAGES.MESSAGES;
      } else if (activePopup && activePopup.notify) {
        tab = PAGES.NOTIFICATIONS;
      } else if (messages.length + notifications.length) {
        tab = PAGES.MESSAGES_LIST;
      }
    }

    /**
     * Start page on locked keeper
     */
    if (!tab && nextProps.locked) {
      tab = NO_USER_START_PAGE;
    }

    if (!tab || (tab && !RootComponent.canUseTab(nextProps, tab))) {
      tab = RootComponent.getStateTab(nextProps);
    }

    if (tab !== state.tab) {
      Sentry.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        level: Sentry.Severity.Info,
        data: {
          from: state.tab,
          to: tab,
        },
      });

      if (tab === PAGES.MESSAGES) {
        const { msg } = activePopup;

        const data: Record<string, string> = {
          type: msg.type,
        };

        if (msg.type === 'transaction') {
          data.transactionType = msg.data.type;
        }

        Sentry.addBreadcrumb({
          type: 'debug',
          category: 'message',
          level: Sentry.Severity.Info,
          data,
        });
      }
    }

    return { tab };
  }

  static getStateTab(props) {
    if (props.locked) {
      return props.initialized ? USER_START_PAGE : NO_USER_START_PAGE;
    }
    return props.accounts.length ? PAGES.ASSETS : PAGES.IMPORT;
  }

  static canUseTab(props, tab) {
    switch (tab) {
      case PAGES.NEW:
      case PAGES.CONDITIONS:
      case PAGES.INTRO:
        return !props.initialized;
      case PAGES.LOGIN:
      case PAGES.FORGOT:
        return props.initialized && props.locked;
      case PAGES.ASSETS:
        return !props.locked && props.accounts.length;
      default:
        return !props.locked;
    }
  }

  render() {
    const tab = this.state.tab || PAGES.INTRO;
    const pageConf = PAGES_CONF[tab];
    const Component = pageConf.component;
    const backTabFromConf =
      typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;
    const currentTab = this.state.tab;
    const { backTabs } = this.props;
    const menuProps = {
      hasLogo: pageConf.menu.hasLogo,
      hasSettings: pageConf.menu.hasSettings,
      deleteAccount: pageConf.menu.deleteAccount,
      hasClose: !!pageConf.menu.close,
      hasBack:
        pageConf.menu.back !== null &&
        (typeof pageConf.menu.back === 'string' || !!pageConf.menu.back),
    };

    const setTab = tab => {
      this.props.addBackTab(currentTab);
      this.props.setTab(tab);
    };

    const onBack = () => {
      const tab =
        backTabFromConf || backTabs[backTabs.length - 1] || PAGES.ROOT;
      this.props.removeBackTab();
      this.props.setTab(tab);
    };

    const onDelete = () => {
      setTab(PAGES.DELETE_ACTIVE_ACCOUNT);
    };

    const pageProps = { ...pageConf.props, setTab, onBack };

    return (
      <div className="height">
        <Menu
          {...menuProps}
          setTab={setTab}
          onBack={onBack}
          onDelete={onDelete}
        />
        <Component {...pageProps} key={tab} />
        <Bottom {...pageConf.bottom} />
      </div>
    );
  }
}

const mapStateToProps = function (store: any) {
  return {
    loading: store.localState.loading,
    locked: store.state && store.state.locked,
    initialized: store.state && store.state.initialized,
    accounts: store.accounts || [],
    tab: store.tab || '',
    tmpTab: store.tmpTab,
    backTabs: store.backTabs,
    messages: store.messages,
    notifications: store.notifications,
    activePopup: store.activePopup,
  };
};

const actions = {
  setLoading: loading,
  setTab,
  addBackTab,
  removeBackTab,
};

export const Root = connect(mapStateToProps, actions)(RootComponent as any);

interface IProps {
  locked: boolean;
  initialized: boolean;
  accounts: Array<any>;
  setTab: (tab: string) => void;
  addBackTab: (tab: string) => void;
  removeBackTab: () => void;
  setLoading: (enable: boolean) => void;
  tab: string;
  backTabs: Array<string>;
  messages: Array<any>;
  notifications: Array<any>;
  activePopup: { msg: any | null; notify: Array<any> | null } | null;
  loading: boolean;
}
