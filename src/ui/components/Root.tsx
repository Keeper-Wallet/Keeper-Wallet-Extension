import * as React from 'react';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES_CONF } from '../pageConfig';
import { PAGES } from '../pages';
import { useAppSelector } from 'ui/store';
import { useNavigate } from 'ui/router';

export function Root() {
  const navigate = useNavigate();

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
