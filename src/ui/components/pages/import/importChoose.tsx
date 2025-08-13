import { useAccountsDispatch } from 'accounts/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui';
// import { NETWORK_CONFIG } from '../../../constants';
// import { NetworkName } from '../../../networks/types';
// import { Button } from '../ui';
// import { generateNewWalletItems } from './NewWallet';
import * as styles from './import.module.css';
// import { newAccountSelect } from '../../../store/actions/localState';
// import { createMultichainAccount } from '../../../units/createMultichainAccount';

export function ImportChoose() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAccountsDispatch();

  const handleMultichainAccount = async () => {
    navigate('/import-multi-seed');
  };

  const handleWavesAccount = async () => {
    navigate('/import-wave-seed');
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
