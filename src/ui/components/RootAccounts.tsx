import * as React from 'react';
import { routes } from '../../accounts/routes';
import { useAccountsSelector } from 'accounts/store';
import { Navigate, useNavigate } from 'ui/router';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';

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

    navigate('/', { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (!initialized && currentPage !== '/init-vault') {
    return <Welcome />;
  }

  if (initialized && locked && currentPage !== '/forgot-password') {
    return <Login />;
  }

  if (initialized && !locked && currentPage === '/forgot-password') {
    return <Navigate to="/" />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
