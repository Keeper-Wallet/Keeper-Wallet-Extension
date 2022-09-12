import * as Sentry from '@sentry/react';
import * as React from 'react';
import { connect } from 'react-redux';
import { addBackTab, loading, removeBackTab, setTab } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { AppState } from 'ui/store';
import { ActivePopupState } from 'ui/reducers/notifications';
import { PreferencesAccount } from 'preferences/types';
import { NotificationsStoreItem } from 'notifications/types';
import { MessageStoreItem } from 'messages/types';

interface StateProps {
  accounts: PreferencesAccount[];
  activePopup: ActivePopupState | null;
  backTabs: string[];
  currentLocale: string;
  initialized: boolean | null | undefined;
  loading: boolean;
  locked: boolean | null | undefined;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
  tab: string;
}

interface DispatchProps {
  addBackTab: (tab: string | null) => void;
  removeBackTab: () => void;
  setLoading: (enable: boolean) => void;
  setTab: (tab: string | null) => void;
}

type Props = StateProps & DispatchProps;

interface State {
  tab: string | null;
}

class RootComponent extends React.Component<Props, State> {
  state: State = { tab: null };

  constructor(props: Props) {
    super(props);
    setTimeout(() => props.setLoading(false), 200);
  }

  static getDerivedStateFromProps(
    nextProps: Readonly<Props>,
    prevState: State
  ): Partial<State> | null {
    if (nextProps.loading) {
      return { tab: PAGES.INTRO };
    }

    let tab = nextProps.tab || PAGES.ROOT;

    if (!tab && nextProps.locked == null) {
      tab = PAGES.INTRO;
    }

    if (
      !nextProps.locked &&
      tab !== PAGES.CHANGE_TX_ACCOUNT &&
      nextProps.accounts.length
    ) {
      if (nextProps.activePopup && nextProps.activePopup.msg) {
        tab = PAGES.MESSAGES;
      } else if (nextProps.activePopup && nextProps.activePopup.notify) {
        tab = PAGES.NOTIFICATIONS;
      } else if (nextProps.messages.length + nextProps.notifications.length) {
        tab = PAGES.MESSAGES_LIST;
      }
    }

    if (!tab && nextProps.locked) {
      tab = PAGES.WELCOME;
    }

    let canUseTab: boolean | number | null | undefined;

    switch (tab) {
      case PAGES.NEW:
      case PAGES.INTRO:
        canUseTab = !nextProps.initialized;
        break;
      case PAGES.LOGIN:
      case PAGES.FORGOT:
        canUseTab = nextProps.initialized && nextProps.locked;
        break;
      case PAGES.ASSETS:
        canUseTab = !nextProps.locked && nextProps.accounts.length;
        break;
      default:
        canUseTab = !nextProps.locked;
        break;
    }

    if (!tab || !canUseTab) {
      tab = nextProps.locked
        ? nextProps.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : nextProps.accounts.length
        ? PAGES.ASSETS
        : PAGES.IMPORT_POPUP;
    }

    if (tab !== prevState.tab) {
      Sentry.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        level: Sentry.Severity.Info,
        data: {
          from: prevState.tab,
          to: tab,
        },
      });

      if (tab === PAGES.MESSAGES) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { msg } = nextProps.activePopup!;

        const data: Record<string, string | number> = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          type: msg!.type,
        };

        if (msg?.type === 'transaction') {
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

  render() {
    const tab = this.state.tab || PAGES.INTRO;
    const pageConf = PAGES_CONF[tab];
    const Component = pageConf.component;
    const backTabFromConf =
      typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;
    const currentTab = this.state.tab;
    const { addBackTab, backTabs, currentLocale, removeBackTab, setTab } =
      this.props;

    const pushTab = (tab: string | null) => {
      addBackTab(currentTab);
      setTab(tab);
    };

    const onBack = () => {
      const tab =
        backTabFromConf || backTabs[backTabs.length - 1] || PAGES.ROOT;
      removeBackTab();
      setTab(tab);
    };

    const onDelete = () => {
      pushTab(PAGES.DELETE_ACTIVE_ACCOUNT);
    };

    return (
      <div className={`height ${currentLocale}`}>
        <Menu
          deleteAccount={pageConf.menu.deleteAccount}
          hasBack={
            pageConf.menu.back !== null &&
            (typeof pageConf.menu.back === 'string' || !!pageConf.menu.back)
          }
          hasClose={!!pageConf.menu.close}
          hasLogo={pageConf.menu.hasLogo}
          hasSettings={pageConf.menu.hasSettings}
          setTab={pushTab}
          onBack={onBack}
          onDelete={onDelete}
        />
        <Component
          {...pageConf.props}
          setTab={pushTab}
          onBack={onBack}
          key={tab}
        />
        <Bottom {...pageConf.bottom} />
      </div>
    );
  }
}

const mapStateToProps = function (state: AppState): StateProps {
  return {
    currentLocale: state.currentLocale,
    loading: state.localState.loading,
    locked: state.state && state.state.locked,
    initialized: state.state && state.state.initialized,
    accounts: state.accounts || [],
    tab: state.tab || '',
    backTabs: state.backTabs,
    messages: state.messages,
    notifications: state.notifications,
    activePopup: state.activePopup,
  };
};

const actions = {
  setLoading: loading,
  setTab,
  addBackTab,
  removeBackTab,
};

export const Root = connect(mapStateToProps, actions)(RootComponent);
