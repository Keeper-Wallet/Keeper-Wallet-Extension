import { useSentryNavigationBreadcrumbs } from '_core/useSentryNavigationBreadcrumbs';
import { usePopupSelector } from 'popup/store/react';
import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Login } from './pages/login';
import { Welcome } from './pages/Welcome';

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialized = usePopupSelector(state => state.state?.initialized);
  const locked = usePopupSelector(state => state.state?.locked);
  const haveAccounts = usePopupSelector(state => state.accounts.length !== 0);

  const haveActiveMessage = usePopupSelector(
    state => state.activePopup?.msg != null,
  );

  const haveActiveNotification = usePopupSelector(
    state => state.activePopup?.notify != null,
  );

  const haveMessagesOrNotifications = usePopupSelector(
    state => state.messages.length !== 0 || state.notifications.length !== 0,
  );

  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const prevNetworkRef = useRef(currentNetwork);
  useEffect(() => {
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
      if (location.pathname !== '/active-message') {
        return <Navigate replace to="/active-message" />;
      }
    } else if (haveActiveNotification) {
      if (location.pathname !== '/active-notification') {
        return <Navigate replace to="/active-notification" />;
      }
    } else if (haveMessagesOrNotifications) {
      if (location.pathname !== '/messages-and-notifications') {
        return <Navigate replace to="/messages-and-notifications" />;
      }
    }
  }

  if (
    (location.pathname === '/active-message' && !haveActiveMessage) ||
    (location.pathname === '/active-notification' && !haveActiveNotification) ||
    (location.pathname === '/messages-and-notifications' &&
      !haveMessagesOrNotifications)
  ) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
