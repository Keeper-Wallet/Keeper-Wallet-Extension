import clsx from 'clsx';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import {  useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect } from 'store/actions/localState';
import { getEthereumData, getWavesData, getUnit0Data } from 'units/ed25519';

import { CHAIN_IDS } from '../../../../constants';
import { NetworkName } from '../../../../networks/types';
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
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const customCodes = usePopupSelector(state => state.customCodes);

  const [seed, setSeed] = useState('');
  const [addressWaves, setAddressWaves] = useState('');
  const [addressEvm, setAddressEvm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [existingAccount, setExistingAccount] =
    useState<PreferencesAccount | null>(null);

  const networkConfig = 'waves';
  const profileConfig = 'todo';
  const networkCode =
    customCodes[currentNetwork] || String(profileConfig?.chainId ?? '');

  const nameRef = useRef('');
  const addressWavesRef = useRef('');
  const addressEvmRef = useRef('');

  useEffect(() => {
    if (!addressWaves) {
      setExistingAccount(null);
      return;
    }
    const found = accounts[0];
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
      const testnetData = await getWavesData(
        normalizedSeed,
        CHAIN_IDS[NetworkName.Testnet],
      );
      const stagenetData = await getWavesData(
        normalizedSeed,
        CHAIN_IDS[NetworkName.Stagenet],
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
    setShowValidationError(true);
    if (!addressWaves || !addressEvm || error) {
      setError(error || 'Enter valid seed');
      return;
    }
    if (existingAccount) {
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
      <form className={styles.multichainForm} onSubmit={handleImport}>
        <div className={styles.titleBlock}>
          <h2 className="title1 margin3 left">Welcome Back</h2>
        </div>
        <div className={styles.inputLabel}>
          Enter your seed phrase to proceed. Usually it consists of either 12,
          18 or 24 words
        </div>
        <Input
          autoFocus
          className={clsx('margin-main-top', styles.inputFullWidth)}
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
        <div className="tag1 basic500 input-title" style={{ marginTop: 8 }}>
          Account address:
        </div>

        <div className={styles.addressWrapper}>
          <div className={styles.greyLine} data-testid="address">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {addressWaves && (
                <div className={styles.addressContainer}>
                  <span style={{ color: '#27ae60', fontSize: 12 }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <rect width="12" height="12" rx="6" fill="white" />
                      <rect
                        x="1.05078"
                        y="6"
                        width="7"
                        height="7"
                        transform="rotate(-45 1.05078 6)"
                        fill="#1F5AF6"
                      />
                    </svg>
                  </span>
                  <span>
                    {addressWaves}
                  </span>
                </div>
              )}
              {addressEvm && (
                <div className={styles.addressContainer}>
                  <span style={{ color: '#27ae60', fontSize: 12 }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <circle cx="6" cy="6" r="6" fill="black" />
                      <path
                        d="M4.93359 6.00195H7.4668V8.53516H2.40039V3.46875H4.93359V6.00195ZM10 6.00195H7.4668V3.46875H10V6.00195Z"
                        fill="#9FE0C1"
                      />
                    </svg>
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10 }}>
                    {addressEvm}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button data-testid="continueBtn" type="submit" view="submit">
          Import Account
        </Button>
      </form>
    </div>
  );
}
