import * as React from 'react';
import { routes } from '../routes';
import { useAppSelector } from 'ui/store';
import { Navigate, useNavigate } from 'ui/router';
import { Login } from './pages/Login';
import { Welcome } from './pages/Welcome';

export function Root() {
  const navigate = useNavigate();
  const currentPage = useAppSelector(state => state.router.currentPage);

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

  if (!initialized) {
    return <Welcome isPopup />;
  }

  if (initialized && locked && currentPage !== '/forgot-password') {
    return <Login />;
  }

  if (initialized && !locked && currentPage === '/forgot-password') {
    return <Navigate to="/" />;
  }

  if (initialized && !locked && haveAccounts) {
    if (haveActiveMessage) {
      if (!['/active-message', '/change-tx-account'].includes(currentPage)) {
        return <Navigate replace to="/active-message" />;
      }
    } else if (haveActiveNotification) {
      if (
        !['/active-notification', '/change-tx-account'].includes(currentPage)
      ) {
        return <Navigate replace to="/active-notification" />;
      }
    } else if (haveMessagesOrNotifications) {
      if (currentPage !== '/messages-and-notifications') {
        return <Navigate replace to="/messages-and-notifications" />;
      }
    }
  }

  if (
    (!haveActiveMessage &&
      ['/active-message', '/change-tx-account'].includes(currentPage)) ||
    (!haveActiveNotification &&
      ['/active-notification', '/change-tx-account'].includes(currentPage)) ||
    (!haveMessagesOrNotifications &&
      currentPage === '/messages-and-notifications')
  ) {
    return <Navigate replace to="/" />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
