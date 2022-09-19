import * as React from 'react';
import { routes } from '../routes';
import { PAGES } from '../pages';
import { useAppSelector } from 'ui/store';
import { Navigate, useNavigate } from 'ui/router';

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

    navigate(PAGES.ASSETS, { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (!initialized && currentPage !== PAGES.WELCOME) {
    return <Navigate to={PAGES.WELCOME} />;
  }

  if (initialized && currentPage === PAGES.WELCOME) {
    return <Navigate to={PAGES.ASSETS} />;
  }

  if (
    initialized &&
    locked &&
    ![PAGES.LOGIN, PAGES.FORGOT].includes(currentPage)
  ) {
    return <Navigate to={PAGES.LOGIN} />;
  }

  if (
    initialized &&
    !locked &&
    [PAGES.LOGIN, PAGES.FORGOT].includes(currentPage)
  ) {
    return <Navigate to={PAGES.ASSETS} />;
  }

  if (initialized && !locked && haveAccounts) {
    if (haveActiveMessage) {
      if (![PAGES.MESSAGES, PAGES.CHANGE_TX_ACCOUNT].includes(currentPage)) {
        return <Navigate replace to={PAGES.MESSAGES} />;
      }
    } else if (haveActiveNotification) {
      if (
        ![PAGES.NOTIFICATIONS, PAGES.CHANGE_TX_ACCOUNT].includes(currentPage)
      ) {
        return <Navigate replace to={PAGES.NOTIFICATIONS} />;
      }
    } else if (haveMessagesOrNotifications) {
      if (currentPage !== PAGES.MESSAGES_LIST) {
        return <Navigate replace to={PAGES.MESSAGES_LIST} />;
      }
    }
  }

  if (
    (!haveActiveMessage &&
      [PAGES.MESSAGES, PAGES.CHANGE_TX_ACCOUNT].includes(currentPage)) ||
    (!haveActiveNotification &&
      [PAGES.NOTIFICATIONS, PAGES.CHANGE_TX_ACCOUNT].includes(currentPage)) ||
    (!haveMessagesOrNotifications && currentPage === PAGES.MESSAGES_LIST)
  ) {
    return <Navigate replace to={PAGES.ASSETS} />;
  }

  return routes.find(route => route.path === currentPage)?.element ?? null;
}
