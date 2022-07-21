import styles from './Welcome.module.css';
import * as React from 'react';
import { BigLogo } from '../head';
import { useTranslation } from 'react-i18next';
import { Button, LangsSelect } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';

interface Props {
  setTab(tab: string): void;
}

export function Welcome({ setTab }: Props) {
  const { t } = useTranslation();
  const tabMode = useAppSelector(state => state.localState?.tabMode);

  React.useEffect(() => {
    if (window.location.hash.split('#')[1] === PAGES.NEW) {
      history.replaceState(history.state, null, window.location.pathname);
      setTab(PAGES.NEW);
    }
  }, [setTab]);

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
          setTab(PAGES.NEW);
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
