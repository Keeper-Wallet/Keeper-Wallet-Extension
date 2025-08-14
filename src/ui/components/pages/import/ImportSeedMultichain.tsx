import clsx from 'clsx';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import {  useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect } from 'store/actions/localState';
import { getEthereumData, getWavesData, getUnit0Data } from 'units/ed25519';

import { CHAIN_IDS } from '../../../../constants';
import { NetworkName } from 'networks/types';
import {
  Button,
  ErrorMessage,
  Input,
} from '../../ui';
import * as styles from './import.module.css';

export function ImportSeedMultichain() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.accounts);
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
    if (!addressWaves) {
      setExistingAccount(null);
      return;
    }
    
    // Find account by matching Waves address instead of taking accounts[0]
    const found = accounts.find(acc => acc.address === addressWaves);
    
    setExistingAccount(found || null);
    if (found) {
      setError(
        `Account with this Waves address already exists${
          found.name ? `: ${found.name}` : ''
        }`,
      );
    } else {
      setError(null);
    }
  }, [addressWaves, accounts]);

  async function handleSeedChange(value: string) {
    const normalizedSeed = value.trim().replace(/\s+/g, ' ');
    setSeed(normalizedSeed);
    setError(null);
    setAddressWaves('');
    setAddressEvm('');
    setExistingAccount(null);
    nameRef.current = '';
    addressWavesRef.current = '';
    addressEvmRef.current = '';
    if (!normalizedSeed) return;
    if (normalizedSeed.length < 12) {
      setError('Seed phrase too short');
      return;
    }
    try {
      const mainnetData = await getWavesData(
        normalizedSeed,
        CHAIN_IDS[NetworkName.Mainnet],
      );
      
      const unit0Address = await getUnit0Data(normalizedSeed);
      const ethereum = getEthereumData(normalizedSeed);
      
      if (!ethereum.address || !unit0Address.address) {
        setError('Invalid seed');
        return;
      }
      
      setAddressWaves(mainnetData.address);
      setAddressEvm(ethereum.address);
      
      addressWavesRef.current = mainnetData.address;
      addressEvmRef.current = ethereum.address;
    } catch (e) {
      setError('Invalid seed');
    }
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    console.log(error, 'error');
    if (!addressWaves || !addressEvm || error) {
      setShowValidationError(true);
      setError(error || 'Enter valid seed');
      return;
    }
    if (existingAccount) {
      setShowValidationError(true);
      setError(
        `Account with this Waves address already exists${
          existingAccount.name ? `: ${existingAccount.name}` : ''
        }`,
      );
      return;
    }
    nameRef.current = '';

    dispatch(
      newAccountSelect({
        address: addressWaves,
        type: 'multichain',
        seed,
        name: ''
      }),
    );
    navigate('/account-name');
  }

  return (
    <div className={styles.root}>
      <form  onSubmit={handleImport}>
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
