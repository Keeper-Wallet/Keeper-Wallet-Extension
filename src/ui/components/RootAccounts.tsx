import { useAccountsSelector } from 'accounts/store';
import { useSentryNavigationBreadcrumbs } from 'common/useSentryNavigationBreadcrumbs';
import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Login } from './pages/login';
import { Welcome } from './pages/Welcome';

export function RootAccounts() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialized = useAccountsSelector(state => state.state?.initialized);
  const locked = useAccountsSelector(state => state.state?.locked);

  const currentNetwork = useAccountsSelector(state => state.currentNetwork);
  const prevNetworkRef = useRef(currentNetwork);
  useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }

    navigate('/', { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  useSentryNavigationBreadcrumbs(location);

  if (!initialized && location.pathname !== '/init-vault') {
    return <Welcome />;
  }

  if (initialized && locked && location.pathname !== '/forgot-password') {
    return <Login />;
  }

  if (initialized && !locked && location.pathname === '/forgot-password') {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
