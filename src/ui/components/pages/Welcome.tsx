import * as styles from './Welcome.module.css';
import * as React from 'react';
import { BigLogo } from '../head';
import { useTranslation } from 'react-i18next';
import { Button, LangsSelect } from '../ui';
import { PageComponentProps, PAGES } from '../../pageConfig';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';

export function Welcome({ pushTab }: PageComponentProps) {
  const { t } = useTranslation();
  const tabMode = useAppSelector(state => state.localState?.tabMode);

  React.useEffect(() => {
    if (window.location.hash.split('#')[1] === PAGES.NEW) {
      history.replaceState(
        history.state,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        window.location.pathname
      );
      pushTab(PAGES.NEW);
    }
  }, [pushTab]);

  return (
    <div className={styles.content}>
      <BigLogo className={styles.logo} />
      <Button
        className={styles.button}
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
          pushTab(PAGES.NEW);
        }}
      >
        {t('welcome.getStarted')}
      </Button>
      <div className={`${styles.text} basic500 body3`}>
        <div>{t('welcome.info')}</div>
        <div>{t('welcome.info2')}</div>
      </div>
      <div className={styles.footer}>
        <LangsSelect />
      </div>
    </div>
  );
}
