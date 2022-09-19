import * as React from 'react';
import { routes } from '../../accounts/routes';
import { ACCOUNTS_PAGES } from '../../accounts/pages';
import { useAccountsSelector } from 'accounts/store';
import { Navigate, useNavigate } from 'ui/router';
import { Login } from './pages/Login';

export function RootAccounts() {
  const navigate = useNavigate();
  const currentPage = useAccountsSelector(state => state.router.currentPage);

  const initialized = useAccountsSelector(state => state.state?.initialized);
  const locked = useAccountsSelector(state => state.state?.locked);

  const currentNetwork = useAccountsSelector(state => state.currentNetwork);
  const prevNetworkRef = React.useRef(currentNetwork);
  React.useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }

    navigate(ACCOUNTS_PAGES.IMPORT_TAB, { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (
    !initialized &&
    ![ACCOUNTS_PAGES.WELCOME, ACCOUNTS_PAGES.NEW].includes(currentPage)
  ) {
    return <Navigate to={ACCOUNTS_PAGES.WELCOME} />;
  }

  if (initialized && locked && currentPage !== ACCOUNTS_PAGES.FORGOT) {
    return <Login />;
  }

  if (initialized && !locked && currentPage === ACCOUNTS_PAGES.FORGOT) {
    return <Navigate to={ACCOUNTS_PAGES.IMPORT_TAB} />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
