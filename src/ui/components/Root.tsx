import * as Sentry from '@sentry/react';
import * as React from 'react';
import { addBackTab, loading, removeBackTab, setTab } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAppDispatch, useAppSelector } from 'ui/store';

export function Root() {
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector(state => state.currentLocale);
  const backTabs = useAppSelector(state => state.backTabs);
  const currentTab = useAppSelector(state => {
    if (state.localState.loading) {
      return PAGES.INTRO;
    }

    let tab = state.tab;

    if (!tab && state.state?.locked == null) {
      tab = PAGES.INTRO;
    }

    if (
      !state.state?.locked &&
      tab !== PAGES.CHANGE_TX_ACCOUNT &&
      state.accounts.length
    ) {
      if (state.activePopup && state.activePopup.msg) {
        tab = PAGES.MESSAGES;
      } else if (state.activePopup && state.activePopup.notify) {
        tab = PAGES.NOTIFICATIONS;
      } else if (state.messages.length + state.notifications.length) {
        tab = PAGES.MESSAGES_LIST;
      }
    }

    if (!tab && state.state?.locked) {
      tab = PAGES.WELCOME;
    }

    let canUseTab = !state.state?.locked;

    switch (tab) {
      case PAGES.NEW:
      case PAGES.INTRO:
        canUseTab = !state.state?.initialized;
        break;
      case PAGES.LOGIN:
      case PAGES.FORGOT:
        canUseTab = Boolean(state.state?.initialized && state.state?.locked);
        break;
      case PAGES.ASSETS:
        canUseTab = !state.state?.locked && state.accounts.length !== 0;
        break;
    }

    if (!tab || !canUseTab) {
      tab = state.state?.locked
        ? state.state?.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : state.accounts.length
        ? PAGES.ASSETS
        : PAGES.IMPORT_POPUP;
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { msg } = state.activePopup!;

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

    return tab;
  });

  React.useEffect(() => {
    setTimeout(() => dispatch(loading(false)), 200);
  }, [dispatch]);

  const pageConf = PAGES_CONF[currentTab];
  const Component = pageConf.component;

  const pushTab = (tab: string | null) => {
    dispatch(addBackTab(currentTab));
    dispatch(setTab(tab));
  };

  const onBack = () => {
    const backTabFromConf =
      typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;

    const tab = backTabFromConf || backTabs[backTabs.length - 1] || PAGES.ROOT;
    dispatch(removeBackTab());
    dispatch(setTab(tab));
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
        pushTab={pushTab}
        onBack={onBack}
        onDelete={onDelete}
      />
      <Component
        {...pageConf.props}
        setTab={pushTab}
        onBack={onBack}
        key={currentTab}
      />
      <Bottom {...pageConf.bottom} />
    </div>
  );
}
