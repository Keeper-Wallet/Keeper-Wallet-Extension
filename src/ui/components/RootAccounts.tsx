import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAccountsSelector } from 'accounts/store';
import { LoadingScreen } from './pages/loadingScreen';

export function RootAccounts() {
  const currentLocale = useAccountsSelector(state => state.currentLocale);
  const isLoading = useAccountsSelector(state => state.localState.loading);
  const currentPage = useAccountsSelector(state => {
    let page = state.router.currentPage;

    if (!page) {
      const pageFromHash = window.location.hash.split('#')[1];
      page = Object.values(PAGES).includes(pageFromHash)
        ? pageFromHash
        : PAGES.ROOT;
    }

    let canUsePage = !state.state?.locked;

    switch (page) {
      case PAGES.NEW:
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
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
