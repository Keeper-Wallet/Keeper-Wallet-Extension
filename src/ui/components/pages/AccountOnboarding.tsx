import { useAccountsDispatch } from 'accounts/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { NETWORK_CONFIG } from '../../../constants';
import { NetworkName } from '../../../networks/types';
import { newAccountSelect } from '../../../store/actions/localState';
import multiAccountsCreate from '../../assets/img/multi-accounts-create.svg';
import shadeBg from '../../assets/img/shade-bg.svg';
import { Button } from '../ui';
import { generateNewWalletItems } from './NewWallet';
import * as styles from './styles/accountOnboarding.styl';

export function AccountOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAccountsDispatch();

  const handleMultichainAccount = async () => {
    // Generate multichain account and seed phrase using factory system
    const { Mnemonic } = await import('ethers');
    const mnemonic = Mnemonic.fromEntropy(
      crypto.getRandomValues(new Uint8Array(16)),
    );
    const phrase = mnemonic.phrase;

    // Set up complete multichain account state (matching original flow)
    dispatch(
      newAccountSelect({
        type: 'multichain',
        name: '',
        address: '', // Will be populated by factory
        seed: phrase, // Include generated seed phrase for backup page
      }),
    );

    // Navigate directly to backup page (matching original flow)
    navigate('/create-account/save-backup');
  };

  const handleWavesAccount = async () => {
    // Generate wallet items for Waves Mainnet (this creates the seed phrase)
    // The same seed will be used to create accounts on all Waves networks
    const mainnetNetworkCode = NETWORK_CONFIG[NetworkName.Mainnet].networkCode;
    await generateNewWalletItems(mainnetNetworkCode);

    dispatch(
      newAccountSelect({
        name: '',
        address: '',
        type: 'seed',
        seed: '',
      }),
    );
    // Navigate to the account creation flow
    navigate('/create-account');
  };

  return (
    <div data-testid="accountOnboarding" className={styles.root}>
      <div className={styles.iconContainer}>
        <img
          className={styles.shadeBg}
          src={shadeBg}
          alt=""
          aria-hidden="true"
        />
        <img
          className={styles.topIcon}
          src={multiAccountsCreate}
          alt=""
          width={216}
          height={137}
        />
      </div>
      <div className={styles.title}>{t('onboarding.multichainAccounts')}</div>

      <p className={styles.description}>
        {t('onboarding.multichainDescription')}
      </p>

      <Button
        data-testid="createMultichainAccountBtn"
        view="submit"
        onClick={handleMultichainAccount}
        className={styles.multichainButton}
      >
        {t('onboarding.createMultichainAccount')}
      </Button>

      <p className={styles.description}>
        {t('onboarding.wavesOnlyDescription')}
      </p>

      <Button view="simple" onClick={handleWavesAccount}>
        {t('onboarding.createWavesAccount')}
      </Button>
    </div>
  );
}
