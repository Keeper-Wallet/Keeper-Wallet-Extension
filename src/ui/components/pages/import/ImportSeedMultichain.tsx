import clsx from 'clsx';
import {
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { type MultiWallet } from 'services/types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect } from 'store/actions/localState';
import { getEthereumData } from 'units/ed25519';

import Background from '../../../services/Background';

import { CHAIN_IDS } from '../../../../constants';
import { NetworkName } from 'networks/types';
import { Button, ErrorMessage, Input } from '../../ui';
import { useTranslation } from 'react-i18next';
import * as styles from './import.module.css';

export function ImportSeedMultichain() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.accounts);
  const { t } = useTranslation();
  const [seed, setSeed] = useState('');
  const [addressWaves, setAddressWaves] = useState('');
  const [addressEvm, setAddressEvm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [existingAccount, setExistingAccount] =
    useState<PreferencesAccount | null>(null);

  const nameRef = useRef('');
  const addressWavesRef = useRef('');
  const addressEvmRef = useRef('');

  useEffect(() => {
    if (!addressWaves || !addressEvm) {
      setExistingAccount(null);
      return;
    }

    // Check for Waves address duplication in MultiWallet storage
    // This works regardless of which network is currently selected
    async function checkDuplicates() {
      const multiWallets = await Background.getMultiWallets();

      // Check if any multiwallet has this Waves mainnet address
      const found = multiWallets.find(
        (wallet: MultiWallet) =>
          wallet.coins?.waves?.networks?.mainnet?.address === addressWaves,
      );

      if (found) {
        // Find matching account in accounts array for UI state
        const accountMatch = accounts.find(acc => acc.name === found.name);
        setExistingAccount(accountMatch || null);
        setError(
          `Account already exists${found.name ? `: ${found.name}` : ''}`,
        );
        setShowValidationError(true);
        return;
      }

      setExistingAccount(null);
      setError(null);
    }

    checkDuplicates();
  }, [addressWaves, addressEvm, accounts]);

  const SEED_MIN_LENGTH = 24;

  async function handleSeedChange(value: string) {
    const normalizedSeed = value.trim().replace(/\s+/g, ' ');
    setSeed(normalizedSeed);
    setError(null);
    setShowValidationError(false);
    setAddressWaves('');
    setAddressEvm('');
    setExistingAccount(null);
    nameRef.current = '';
    addressWavesRef.current = '';
    addressEvmRef.current = '';
    if (!normalizedSeed) {
      setError(t('importSeed.requiredError'));
      return;
    }
    if (normalizedSeed.length < SEED_MIN_LENGTH) {
      setError(t('importSeed.seedLengthError', { minLength: SEED_MIN_LENGTH }));
      return;
    }
    try {
      // Use SAME derivation as SeedWalletStrategy (standard Waves)
      const privateKey = await createPrivateKey(utf8Encode(normalizedSeed));
      const publicKey = await createPublicKey(privateKey);
      const mainnetAddress = base58Encode(
        createAddress(publicKey, CHAIN_IDS[NetworkName.Mainnet]),
      );

      const ethereum = getEthereumData(normalizedSeed);

      if (!ethereum.address) {
        setError('Invalid seed');
        return;
      }

      setAddressWaves(mainnetAddress);
      setAddressEvm(ethereum.address);

      addressWavesRef.current = mainnetAddress;
      addressEvmRef.current = ethereum.address;
    } catch (e) {
      setError('Invalid seed');
    }
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault();

    if (!seed) {
      setShowValidationError(true);
      setError(t('importSeed.requiredError'));
      return;
    }

    if (!addressWaves || !addressEvm || error) {
      setShowValidationError(true);
      setError(error || 'Enter valid seed');
      return;
    }

    nameRef.current = '';

    dispatch(
      newAccountSelect({
        address: addressWaves,
        type: 'multichain',
        seed,
        name: '',
      }),
    );
    navigate('/account-name');
  }

  return (
    <div className={styles.root}>
      <form onSubmit={handleImport}>
        <div>
          <h2 className="title1 margin3 left">Welcome Back</h2>
        </div>
        <div>
          Enter your seed phrase to proceed. Usually it consists of either 12,
          18 or 24 words
        </div>
        <Input
          autoFocus
          className={clsx('margin-main-top')}
          data-testid="seedInput"
          error={!!error && showValidationError}
          multiLine
          rows={3}
          spellCheck={false}
          value={seed}
          onChange={event => {
            handleSeedChange(event.target.value);
          }}
        />
        <ErrorMessage
          className={styles.error}
          data-testid="validationError"
          show={showValidationError && !!error}
        >
          {error}
        </ErrorMessage>

        <Button data-testid="continueBtn" type="submit" view="submit">
          Import Account
        </Button>
      </form>
    </div>
  );
}
