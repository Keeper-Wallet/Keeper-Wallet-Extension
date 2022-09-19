import * as React from 'react';
import { routes } from '../../accounts/routes';
import { PAGES } from '../pages';
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

    navigate(PAGES.IMPORT_TAB, { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (!initialized && ![PAGES.WELCOME, PAGES.NEW].includes(currentPage)) {
    return <Navigate to={PAGES.WELCOME} />;
  }

  if (initialized && locked && currentPage !== PAGES.FORGOT) {
    return <Login />;
  }

  if (initialized && !locked && currentPage === PAGES.FORGOT) {
    return <Navigate to={PAGES.IMPORT_TAB} />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
