import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import background from 'ui/services/Background';

import { BigLogo } from '../head';
import { Button, LangsSelect } from '../ui';
import * as styles from './Welcome.module.css';

interface Props {
  isPopup?: boolean;
}

export function Welcome({ isPopup }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={styles.content}>
      <BigLogo className={styles.logo} />
      <Button
        className={styles.button}
        data-testid="getStartedBtn"
        type="submit"
        view="submit"
        onClick={() => {
          if (isPopup) {
            return background.showTab(
              `${window.location.origin}/accounts.html#/init-vault`,
              'accounts',
            );
          }
          navigate('/init-vault');
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
