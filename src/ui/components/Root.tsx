import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAppSelector } from 'ui/store';
import { LoadingScreen } from './pages';
import { useNavigate } from 'ui/router';

export function Root() {
  const navigate = useNavigate();
  const currentLocale = useAppSelector(state => state.currentLocale);
  const isLoading = useAppSelector(state => state.localState.loading);

  const currentPage = useAppSelector(state => {
    let page = state.router.currentPage;
    const initialized = state.state?.initialized;
    const locked = state.state?.locked;
    const haveAccounts = state.accounts.length !== 0;

    if (!locked && haveAccounts && page !== PAGES.CHANGE_TX_ACCOUNT) {
      if (state.activePopup?.msg) {
        page = PAGES.MESSAGES;
      } else if (state.activePopup?.notify) {
        page = PAGES.NOTIFICATIONS;
      } else if (state.messages.length + state.notifications.length) {
        page = PAGES.MESSAGES_LIST;
      }
    }

    if ([PAGES.LOGIN, PAGES.FORGOT].includes(page)) {
      if (!locked) {
        page = haveAccounts ? PAGES.ASSETS : PAGES.IMPORT_POPUP;
      } else if (!initialized) {
        page = PAGES.WELCOME;
      }
    } else if (page === PAGES.ASSETS) {
      if (locked) {
        page = initialized ? PAGES.LOGIN : PAGES.WELCOME;
      } else if (!haveAccounts) {
        page = PAGES.IMPORT_POPUP;
      }
    } else if (locked) {
      page = initialized ? PAGES.LOGIN : PAGES.WELCOME;
    } else if (!page) {
      page = haveAccounts ? PAGES.ASSETS : PAGES.IMPORT_POPUP;
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

  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const prevNetworkRef = React.useRef(currentNetwork);
  React.useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }

    navigate(PAGES.ASSETS, { replace: true });
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
            hasBack={pageConf.menu?.back}
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
