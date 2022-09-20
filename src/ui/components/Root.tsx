import { useSentryNavigationBreadcrumbs } from 'common/useSentryNavigationBreadcrumbs';
import * as React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from 'ui/store';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialized = useAppSelector(state => state.state?.initialized);
  const locked = useAppSelector(state => state.state?.locked);
  const haveAccounts = useAppSelector(state => state.accounts.length !== 0);

  const haveActiveMessage = useAppSelector(
    state => state.activePopup?.msg != null
  );

  const haveActiveNotification = useAppSelector(
    state => state.activePopup?.notify != null
  );

  const haveMessagesOrNotifications = useAppSelector(
    state => state.messages.length !== 0 || state.notifications.length !== 0
  );

  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const prevNetworkRef = React.useRef(currentNetwork);
  React.useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }

    navigate('/', { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  useSentryNavigationBreadcrumbs(location);

  if (!initialized) {
    return <Welcome isPopup />;
  }

  if (locked && location.pathname !== '/forgot-password') {
    return <Login />;
  }

  if (!locked && location.pathname === '/forgot-password') {
    return <Navigate to="/" />;
  }

  if (!locked && haveAccounts) {
    if (haveActiveMessage) {
      if (
        !['/active-message', '/change-tx-account'].includes(location.pathname)
      ) {
        return <Navigate replace to="/active-message" />;
      }
    } else if (haveActiveNotification) {
      if (
        !['/active-notification', '/change-tx-account'].includes(
          location.pathname
        )
      ) {
        return <Navigate replace to="/active-notification" />;
      }
    } else if (haveMessagesOrNotifications) {
      if (location.pathname !== '/messages-and-notifications') {
        return <Navigate replace to="/messages-and-notifications" />;
      }
    }
  }

  if (
    (!haveActiveMessage &&
      ['/active-message', '/change-tx-account'].includes(location.pathname)) ||
    (!haveActiveNotification &&
      ['/active-notification', '/change-tx-account'].includes(
        location.pathname
      )) ||
    (!haveMessagesOrNotifications &&
      location.pathname === '/messages-and-notifications')
  ) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
