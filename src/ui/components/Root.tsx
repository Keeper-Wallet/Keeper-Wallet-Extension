import * as React from 'react';
import { routes } from '../routes';
import { POPUP_PAGES } from '../pages';
import { useAppSelector } from 'ui/store';
import { Navigate, useNavigate } from 'ui/router';
import { Login } from './pages/Login';

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

    navigate(POPUP_PAGES.ASSETS, { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (!initialized && currentPage !== POPUP_PAGES.WELCOME) {
    return <Navigate to={POPUP_PAGES.WELCOME} />;
  }

  if (initialized && currentPage === POPUP_PAGES.WELCOME) {
    return <Navigate to={POPUP_PAGES.ASSETS} />;
  }

  if (initialized && locked && currentPage !== POPUP_PAGES.FORGOT) {
    return <Login />;
  }

  if (initialized && !locked && currentPage === POPUP_PAGES.FORGOT) {
    return <Navigate to={POPUP_PAGES.ASSETS} />;
  }

  if (initialized && !locked && haveAccounts) {
    if (haveActiveMessage) {
      if (
        ![POPUP_PAGES.MESSAGES, POPUP_PAGES.CHANGE_TX_ACCOUNT].includes(
          currentPage
        )
      ) {
        return <Navigate replace to={POPUP_PAGES.MESSAGES} />;
      }
    } else if (haveActiveNotification) {
      if (
        ![POPUP_PAGES.NOTIFICATIONS, POPUP_PAGES.CHANGE_TX_ACCOUNT].includes(
          currentPage
        )
      ) {
        return <Navigate replace to={POPUP_PAGES.NOTIFICATIONS} />;
      }
    } else if (haveMessagesOrNotifications) {
      if (currentPage !== POPUP_PAGES.MESSAGES_LIST) {
        return <Navigate replace to={POPUP_PAGES.MESSAGES_LIST} />;
      }
    }
  }

  if (
    (!haveActiveMessage &&
      [POPUP_PAGES.MESSAGES, POPUP_PAGES.CHANGE_TX_ACCOUNT].includes(
        currentPage
      )) ||
    (!haveActiveNotification &&
      [POPUP_PAGES.NOTIFICATIONS, POPUP_PAGES.CHANGE_TX_ACCOUNT].includes(
        currentPage
      )) ||
    (!haveMessagesOrNotifications && currentPage === POPUP_PAGES.MESSAGES_LIST)
  ) {
    return <Navigate replace to={POPUP_PAGES.ASSETS} />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
