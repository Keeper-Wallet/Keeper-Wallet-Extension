import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAccountsSelector } from 'accounts/store';
import { LoadingScreen } from './pages/loadingScreen';
import { useNavigate } from 'ui/router';

export function RootAccounts() {
  const navigate = useNavigate();
  const currentLocale = useAccountsSelector(state => state.currentLocale);
  const isLoading = useAccountsSelector(state => state.localState.loading);

  const currentPage = useAccountsSelector(state => {
    let page = state.router.currentPage;
    const initialized = state.state?.initialized;
    const locked = state.state?.locked;

    if (!page) {
      const pageFromHash = window.location.hash.split('#')[1];

      if (Object.values(PAGES).includes(pageFromHash)) {
        page = pageFromHash;
      }
    }

    if (page === PAGES.NEW) {
      if (initialized) {
        page = locked ? PAGES.LOGIN : PAGES.IMPORT_TAB;
      }
    } else if ([PAGES.LOGIN, PAGES.FORGOT].includes(page)) {
      if (!locked) {
        page = PAGES.IMPORT_TAB;
      } else if (!initialized) {
        page = PAGES.WELCOME;
      }
    } else if (locked) {
      page = initialized ? PAGES.LOGIN : PAGES.WELCOME;
    } else if (!page) {
      page = PAGES.IMPORT_TAB;
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

  const currentNetwork = useAccountsSelector(state => state.currentNetwork);
  const prevNetworkRef = React.useRef(currentNetwork);

  React.useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }

    navigate(PAGES.IMPORT_TAB, { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

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
