import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../ui';
import * as styles from './import.module.css';

export function ImportChoose() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleMultichainAccount = async () => {
    navigate('/import-multi-seed');
  };

  const handleWavesAccount = async () => {
    navigate('/import-waves-seed');
  };

  return (
    <div data-testid="accountOnboarding" className={styles.root}>
      <div className={styles.chooseTypeTitle}>{t('import.chooseAccount')}</div>
      <div className={styles.separatorBtns}>
        <Button
          data-testid="createMultichainAccountBtn"
          view="submit"
          onClick={handleMultichainAccount}
        >
          {t('import.importMultiChain')}
        </Button>

        <Button view="simple" onClick={handleWavesAccount}>
          {t('import.importWaves')}
        </Button>
      </div>
    </div>
  );
}
