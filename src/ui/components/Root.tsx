import * as Sentry from '@sentry/react';
import * as React from 'react';
import { loading, removeBackPage, navigate } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAppDispatch, useAppSelector } from 'ui/store';

export function Root() {
  const dispatch = useAppDispatch();
  const currentLocale = useAppSelector(state => state.currentLocale);
  const backPages = useAppSelector(state => state.router.backPages);
  const currentPage = useAppSelector(state => {
    if (state.localState.loading) {
      return PAGES.INTRO;
    }

    let page = state.router.currentPage;

    if (!page && state.state?.locked == null) {
      page = PAGES.INTRO;
    }

    if (
      !state.state?.locked &&
      page !== PAGES.CHANGE_TX_ACCOUNT &&
      state.accounts.length
    ) {
      if (state.activePopup && state.activePopup.msg) {
        page = PAGES.MESSAGES;
      } else if (state.activePopup && state.activePopup.notify) {
        page = PAGES.NOTIFICATIONS;
      } else if (state.messages.length + state.notifications.length) {
        page = PAGES.MESSAGES_LIST;
      }
    }

    let canUsePage = !state.state?.locked;

    switch (page) {
      case PAGES.NEW:
      case PAGES.INTRO:
        canUsePage = !state.state?.initialized;
        break;
      case PAGES.LOGIN:
      case PAGES.FORGOT:
        canUsePage = Boolean(state.state?.initialized && state.state?.locked);
        break;
      case PAGES.ASSETS:
        canUsePage = !state.state?.locked && state.accounts.length !== 0;
        break;
    }

    if (!page || !canUsePage) {
      page = state.state?.locked
        ? state.state?.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : state.accounts.length
        ? PAGES.ASSETS
        : PAGES.IMPORT_POPUP;
    }

    if (page !== state.router.currentPage) {
      Sentry.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        level: Sentry.Severity.Info,
        data: {
          from: state.router.currentPage,
          to: page,
        },
      });
    }

    return page;
  });

  React.useEffect(() => {
    setTimeout(() => dispatch(loading(false)), 200);
  }, [dispatch]);

  const pageConf = PAGES_CONF[currentPage];
  const Component = pageConf.component;

  const onBack = () => {
    const page = backPages[backPages.length - 1] || PAGES.ROOT;
    dispatch(removeBackPage());
    dispatch(navigate(page, { replace: true }));
  };

  return (
    <div className={`height ${currentLocale}`}>
      <Menu
        hasBack={pageConf.menu?.back}
        hasClose={pageConf.menu?.close}
        hasLogo={pageConf.menu?.hasLogo}
        hasSettings={pageConf.menu?.hasSettings}
        onBack={onBack}
      />
      <Component onBack={onBack} />
      <Bottom
        hide={pageConf.bottom?.hide}
        noChangeNetwork={pageConf.bottom?.noChangeNetwork}
      />
    </div>
  );
}
