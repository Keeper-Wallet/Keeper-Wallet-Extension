import {
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import clsx from 'clsx';
import { NetworkName } from 'networks/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { type MultiWallet } from 'services/types';
import { newAccountSelect } from 'store/actions/localState';
import { getEthereumData } from 'units/ed25519';

import { CHAIN_IDS } from '../../../../constants';
import Background from '../../../services/Background';
import { Button, ErrorMessage, Input } from '../../ui';
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

  const nameRef = useRef('');
  const addressWavesRef = useRef('');
  const addressEvmRef = useRef('');

  useEffect(() => {
    if (!addressWaves || !addressEvm) {
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
        setError(
          t('importSeed.accountExistsError', {
            name: found.name || '',
          }),
        );
        return;
      }

      setError(null);
    }

    checkDuplicates();
  }, [addressWaves, addressEvm, accounts, t]);

  const ALLOWED_WORD_COUNTS = [12, 24] as const;

  async function handleSeedChange(value: string) {
    const normalizedSeed = value.trim().replace(/\s+/g, ' ');
    setSeed(normalizedSeed);
    setError(null);
    setShowValidationError(false);
    setAddressWaves('');
    setAddressEvm('');
    nameRef.current = '';
    addressWavesRef.current = '';
    addressEvmRef.current = '';
    if (!normalizedSeed) {
      setError(t('importSeed.requiredError'));
      return;
    }
    // Validate by words count
    const wordCount = normalizedSeed.split(/\s+/).filter(Boolean).length;
    if (
      !ALLOWED_WORD_COUNTS.includes(
        wordCount as (typeof ALLOWED_WORD_COUNTS)[number],
      )
    ) {
      setError(t('importSeed.seedWordsAllowedError'));
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
        setError(t('importSeed.invalidSeed'));
        return;
      }

      setAddressWaves(mainnetAddress);
      setAddressEvm(ethereum.address);

      addressWavesRef.current = mainnetAddress;
      addressEvmRef.current = ethereum.address;
    } catch (e) {
      setError(t('importSeed.invalidSeed'));
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
      setError(error || t('importSeed.enterValidSeed'));
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
          <h2 className="title1 margin3 left">
            {t('importSeedMultichain.welcomeBack')}
          </h2>
        </div>
        <div>{t('importSeedMultichain.hint')}</div>
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
          show={!!error && showValidationError}
        >
          {error}
        </ErrorMessage>

        <Button data-testid="continueBtn" type="submit" view="submit">
          {t('importSeed.importAccount')}
        </Button>
      </form>
    </div>
  );
}
