import { useAccountsDispatch } from 'accounts/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { NETWORK_CONFIG } from '../../../constants';
import { NetworkName } from '../../../networks/types';
import { Button } from '../ui';
import { generateNewWalletItems } from './NewWallet';
import * as styles from './styles/accountOnboarding.styl';
import { newAccountSelect } from '../../../store/actions/localState';
import { createMultichainAccount } from '../../../units/createMultichainAccount';

export function AccountOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAccountsDispatch();

  const handleMultichainAccount = async () => {
    const { account, phrase } = await createMultichainAccount();
    dispatch(
      newAccountSelect({
        type: 'multichain',
        address: account.accounts.waves.networks.mainnet.address,
        name: '',
        accountType: 'multichain',
        seed: phrase,
      }),
    );
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
    // Navigate to the account creation flow with query parameter
    navigate('/create-waves-account');
  };

  return (
    <div data-testid="accountOnboarding" className={styles.root}>
      <div className={styles.title}>
        {t('onboarding.multichainAccounts')}
      </div>

      <p className={styles.description}>
        {t('onboarding.multichainDescription')}
      </p>

      <Button
        data-testid="createMultichainAccountBtn"
        view="submit"
        onClick={handleMultichainAccount}
      >
        {t('onboarding.createMultichainAccount')}
      </Button>

      <p className={styles.description}>
        {t('onboarding.wavesOnlyDescription')}
      </p>

      <Button
        view="simple"
        onClick={handleWavesAccount}
      >
        {t('onboarding.createWavesAccount')}
      </Button>
    </div>
  );
}
