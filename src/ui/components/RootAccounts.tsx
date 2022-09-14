import * as Sentry from '@sentry/react';
import * as React from 'react';
import { loading } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';

export function RootAccounts() {
  const dispatch = useAppDispatch();
  const currentLocale = useAccountsSelector(state => state.currentLocale);
  const currentPage = useAccountsSelector(state => {
    if (state.localState.loading) {
      return PAGES.INTRO;
    }

    let page = state.router.currentPage;

    if (typeof state.router.currentPage !== 'string') {
      const pageFromHash = window.location.hash.split('#')[1];
      page = Object.values(PAGES).includes(pageFromHash)
        ? pageFromHash
        : PAGES.ROOT;
    }

    if (!page && state.state?.locked == null) {
      page = PAGES.INTRO;
    }

    let canUsePage = !state.state?.locked;

    switch (page) {
      case PAGES.NEW:
      case PAGES.INTRO:
        canUsePage = !state.state?.initialized;
        break;
      case PAGES.LOGIN:
      case PAGES.FORGOT:
        canUsePage = Boolean(state.state?.initialized && state.state?.locked);
        break;
    }

    if (!page || !canUsePage) {
      page = state.state?.locked
        ? state.state?.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : PAGES.IMPORT_TAB;
    }

    return page;
  });

  React.useEffect(() => {
    setTimeout(() => dispatch(loading(false)), 200);
  }, [dispatch]);

  const prevPageRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const prevPage = prevPageRef.current;

    Sentry.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      level: Sentry.Severity.Info,
      data: {
        from: prevPage,
        to: currentPage,
      },
    });

    prevPageRef.current = currentPage;
  }, [currentPage]);

  const pageConf = PAGES_CONF[currentPage];
  const Component = pageConf.component;

  return (
    <div className={`height ${currentLocale}`}>
      <Menu
        hasBack={
          currentPage !== window.location.hash.split('#')[1] &&
          pageConf.menu?.back
        }
        hasClose={pageConf.menu?.close}
        hasLogo={pageConf.menu?.hasLogo}
        hasSettings={pageConf.menu?.hasSettings}
      />
      <Component />
      <Bottom
        hide={pageConf.bottom?.hide}
        noChangeNetwork={pageConf.bottom?.noChangeNetwork}
      />
    </div>
  );
}
