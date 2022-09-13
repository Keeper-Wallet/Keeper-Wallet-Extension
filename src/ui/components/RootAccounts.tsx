import * as Sentry from '@sentry/react';
import * as React from 'react';
import { addBackPage, loading, removeBackPage, navigate } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';

export function RootAccounts() {
  const dispatch = useAppDispatch();
  const currentLocale = useAccountsSelector(state => state.currentLocale);
  const backPages = useAccountsSelector(state => state.router.backPages);
  const currentTab = useAccountsSelector(state => {
    if (state.localState.loading) {
      return PAGES.INTRO;
    }

    let tab = state.router.currentPage;

    if (typeof state.router.currentPage !== 'string') {
      const page = window.location.hash.split('#')[1];
      tab = Object.values(PAGES).includes(page) ? page : PAGES.ROOT;
    }

    if (!tab && state.state?.locked == null) {
      tab = PAGES.INTRO;
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
    }

    if (!tab || !canUseTab) {
      tab = state.state?.locked
        ? state.state?.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : PAGES.IMPORT_TAB;
    }

    if (tab !== state.router.currentPage) {
      Sentry.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        level: Sentry.Severity.Info,
        data: {
          from: state.router.currentPage,
          to: tab,
        },
      });
    }

    return tab;
  });

  React.useEffect(() => {
    setTimeout(() => dispatch(loading(false)), 200);
  }, [dispatch]);

  const pageConf = PAGES_CONF[currentTab];
  const Component = pageConf.component;

  const pushTab = (tab: string | null) => {
    dispatch(addBackPage(currentTab));
    dispatch(navigate(tab, { replace: true }));
  };

  const onBack = () => {
    const backTabFromConf =
      typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;

    const tab =
      backTabFromConf || backPages[backPages.length - 1] || PAGES.ROOT;
    dispatch(removeBackPage());
    dispatch(navigate(tab, { replace: true }));
  };

  return (
    <div className={`height ${currentLocale}`}>
      <Menu
        hasBack={
          currentTab !== window.location.hash.split('#')[1] &&
          pageConf.menu.back !== null &&
          (typeof pageConf.menu.back === 'string' || !!pageConf.menu.back)
        }
        hasClose={pageConf.menu.close}
        hasLogo={pageConf.menu.hasLogo}
        hasSettings={pageConf.menu.hasSettings}
        pushTab={pushTab}
        onBack={onBack}
      />
      <Component
        {...pageConf.props}
        pushTab={pushTab}
        onBack={onBack}
        key={currentTab}
      />
      <Bottom {...pageConf.bottom} />
    </div>
  );
}
