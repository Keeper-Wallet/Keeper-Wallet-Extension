import * as styles from './styles/welcome.styl';
import * as React from 'react';
import { BigLogo } from '../head';
import { Trans } from 'react-i18next';
import { Button } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';

interface Props {
  setTab(tab: string): void;
}

export function Welcome({ setTab }: Props) {
  const tabMode = useAppSelector(state => state.localState?.tabMode);

  React.useEffect(() => {
    if (window.location.hash.split('#')[1] === PAGES.NEW) {
      history.replaceState(history.state, null, window.location.pathname);
      setTab(PAGES.NEW);
    }
  }, []);

  return (
    <div className={`${styles.content}`}>
      <BigLogo className="margin-main-large" />
      <Button
        data-testid="getStartedBtn"
        type="submit"
        view="submit"
        onClick={() => {
          if (tabMode === 'popup') {
            return background.showTab(
              `${window.location.origin}/accounts.html#${PAGES.NEW}`,
              'accounts'
            );
          }
          setTab(PAGES.NEW);
        }}
        className="margin-main-big"
      >
        <Trans i18nKey="welcome.getStarted">Get Started</Trans>
      </Button>
      <div className="basic500 body3">
        <div>
          <Trans i18nKey="welcome.info">
            Waves Keeper — is the safest way to interact with third-party web
            resources with Waves-integrated functionality or DApps.
          </Trans>
        </div>
        <div>
          <Trans i18nKey="welcome.info2">
            Using Waves Keeper, you can sign transactions and remain safe from
            malicious sites.
          </Trans>
        </div>
      </div>
    </div>
  );
}
