import * as React from 'react';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAccountsSelector } from 'accounts/store';
import { useNavigate } from 'ui/router';

export function RootAccounts() {
  const navigate = useNavigate();

  const currentPage = useAccountsSelector(state => {
    let page = state.router.currentPage;
    const initialized = state.state?.initialized;
    const locked = state.state?.locked;

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

  console.log({ currentPage });

  if ('element' in pageConf) {
    return pageConf.element;
  }

  const Component = pageConf.component;

  return (
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
  );
}
