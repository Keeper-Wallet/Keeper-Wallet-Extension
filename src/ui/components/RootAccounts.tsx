import * as React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAccountsSelector } from 'accounts/store';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';

export function RootAccounts() {
  const navigate = useNavigate();
  const location = useLocation();

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
