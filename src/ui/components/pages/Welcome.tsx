import * as styles from './Welcome.module.css';
import * as React from 'react';
import { BigLogo } from '../head';
import { useTranslation } from 'react-i18next';
import { Button, LangsSelect } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAppDispatch, useAppSelector } from 'ui/store';
import background from 'ui/services/Background';
import { navigate } from 'ui/actions/router';

export function Welcome() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const tabMode = useAppSelector(state => state.localState?.tabMode);

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
          dispatch(navigate(PAGES.NEW));
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
