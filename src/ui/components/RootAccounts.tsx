import * as Sentry from '@sentry/react';
import * as React from 'react';
import { addBackTab, loading, removeBackTab, setTab } from '../actions';
import { Menu } from './menu';
import { Bottom } from './bottom';
import { PAGES, PAGES_CONF } from '../pageConfig';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';

export function RootAccounts() {
  const dispatch = useAppDispatch();
  const backTabs = useAccountsSelector(state => state.backTabs);
  const currentTab = useAccountsSelector(state => {
    if (state.localState.loading) {
      return PAGES.INTRO;
    }

    let tab = state.tab ?? '';

    if (!tab && state.state?.locked == null) {
      tab = PAGES.INTRO;
    }

    if (!tab && state.state?.locked) {
      tab = PAGES.WELCOME;
    }

    const canUseTab = [PAGES.NEW, PAGES.INTRO].includes(tab)
      ? !state.state?.initialized
      : [PAGES.LOGIN, PAGES.FORGOT].includes(tab)
      ? state.state?.initialized && state.state?.locked
      : !state.state?.locked;

    if (!tab || !canUseTab) {
      tab = state.state?.locked
        ? state.state?.initialized
          ? PAGES.LOGIN
          : PAGES.WELCOME
        : PAGES.IMPORT_TAB;
    }

    if (tab !== state.tab) {
      Sentry.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        level: Sentry.Severity.Info,
        data: {
          from: state.tab,
          to: tab,
        },
      });
    }

    return tab;
  });

  React.useEffect(() => {
    setTimeout(() => dispatch(loading(false)), 200);
  }, []);

  const pageConf = PAGES_CONF[currentTab];
  const Component = pageConf.component;
  const backTabFromConf =
    typeof pageConf.menu.back === 'string' ? pageConf.menu.back : null;

  const onSetTab = React.useCallback(
    tab => {
      dispatch(addBackTab(currentTab));
      dispatch(setTab(tab));
    },
    [currentTab]
  );

  const onBack = React.useCallback(() => {
    const tab = backTabFromConf || backTabs[backTabs.length - 1] || PAGES.ROOT;
    dispatch(removeBackTab());
    dispatch(setTab(tab));
  }, [backTabFromConf, backTabs]);

  const onDelete = React.useCallback(() => {
    setTab(PAGES.DELETE_ACTIVE_ACCOUNT);
  }, []);

  const pageProps = { ...pageConf.props, setTab: onSetTab, onBack };

  return (
    <div className="height">
      <Menu
        hasLogo={pageConf.menu.hasLogo}
        hasSettings={pageConf.menu.hasSettings}
        deleteAccount={pageConf.menu.deleteAccount}
        hasClose={!!pageConf.menu.close}
        hasBack={
          pageConf.menu.back !== null &&
          (typeof pageConf.menu.back === 'string' || !!pageConf.menu.back)
        }
        setTab={onSetTab}
        onBack={onBack}
        onDelete={onDelete}
      />
      <Component {...pageProps} key={currentTab} />
      <Bottom {...pageConf.bottom} />
    </div>
  );
}
