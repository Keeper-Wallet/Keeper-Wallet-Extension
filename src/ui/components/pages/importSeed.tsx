import {
    base58Decode,
    base58Encode,
    createAddress,
    createPrivateKey,
    createPublicKey,
    utf8Encode,
} from '@keeper-wallet/waves-crypto';
import clsx from 'clsx';
import { isAddressString, isBase58 } from 'messages/utils';
import { type NetworkProfile } from 'networks/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect, selectAccount } from 'store/actions/localState';
import invariant from 'tiny-invariant';
import { getEthereumData, getWavesData } from 'units/ed25519';

import { NETWORKS } from '../../../networks/config';
import {
    Button,
    ErrorMessage,
    Input,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from '../ui';
import { InlineButton } from '../ui/buttons/inlineButton';
import * as styles from './importSeed.module.css';

const SEED_MIN_LENGTH = 24;
const ENCODED_SEED_MIN_LENGTH = 16;

const SEED_TAB_INDEX = 0;
const ENCODED_SEED_TAB_INDEX = 1;
const PRIVATE_KEY_TAB_INDEX = 2;

function stripBase58Prefix(str: string) {
  return str.replace(/^base58:/, '');
}

export function ImportSeedWaves() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();
  const accounts = usePopupSelector(state => state.accounts);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const customCodes = usePopupSelector(state => state.customCodes);

  const [activeTab, setActiveTab] = useState(SEED_TAB_INDEX);

  const [showValidationError, setShowValidationError] = useState(false);

  const [seedValue, setSeedValue] = useState<string>('');
  const [encodedSeedValue, setEncodedSeedValue] = useState<string>('');
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('');

  const networkConfig = NETWORKS.find(n => n.network === 'waves');
  const profileConfig = networkConfig?.params[currentNetwork as NetworkProfile];
  const networkCode =
    customCodes[currentNetwork] || String(profileConfig?.chainId ?? '');

  const [address, setAddress] = useState<string>();

  const [validationError, setValidationError] = useState<
    React.ReactElement | string
  >();

  const getAccountAddress = (account: (typeof accounts)[number]) => {
    if (!account) return undefined;
    if (account.accountType === 'multichain') {
      return account.accounts.waves?.address;
    }
    return account.address;
  };

  const findExistingAccount = useCallback(
    (addr: string | undefined) =>
      addr && accounts.find(acc => getAccountAddress(acc) === addr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts],
  );

  const [isAddressInProgress, setIsAddressInProgress] = useState(false);

  useEffect(() => {
    const base58PrefixErrorSwitchTabButton = (
      <InlineButton
        className={styles.errorButton}
        onClick={() => {
          let newEncodedSeedValue = '';

          if (activeTab === SEED_TAB_INDEX) {
            newEncodedSeedValue = seedValue;
          } else if (activeTab === PRIVATE_KEY_TAB_INDEX) {
            newEncodedSeedValue = privateKeyValue;
          }

          setEncodedSeedValue(newEncodedSeedValue);
          setShowValidationError(false);
          setActiveTab(ENCODED_SEED_TAB_INDEX);
        }}
      />
    );

    function validateAddress(addr: string) {
      const existingAccount = findExistingAccount(addr);

      if (existingAccount) {
        setValidationError(
          t('importSeed.accountExistsError', {
            name: existingAccount.name,
          }),
        );
      } else {
        setValidationError(undefined);
      }
    }

    if (activeTab === SEED_TAB_INDEX) {
      const trimmedSeedValue = seedValue.trim();

      if (!trimmedSeedValue) {
        setValidationError(t('importSeed.requiredError'));
      } else if (trimmedSeedValue.length < SEED_MIN_LENGTH) {
        setValidationError(
          t('importSeed.seedLengthError', {
            minLength: SEED_MIN_LENGTH,
          }),
        );
      } else if (
        trimmedSeedValue.startsWith('base58:') &&
        isBase58(stripBase58Prefix(trimmedSeedValue))
      ) {
        setValidationError(
          <Trans
            i18nKey="importSeed.base58PrefixError"
            t={t}
            components={{ switchTab: base58PrefixErrorSwitchTabButton }}
          />,
        );
      } else if (isAddressString(trimmedSeedValue)) {
        setValidationError(t('importSeed.seedIsAddressError'));
      } else if (/^alias:/i.test(trimmedSeedValue)) {
        setValidationError(t('importSeed.seedIsAliasError'));
      } else if (
        isBase58(trimmedSeedValue) &&
        base58Decode(trimmedSeedValue).length === 32
      ) {
        setValidationError(
          <Trans
            i18nKey="importSeed.seedIsPublicOrPrivateKeyError"
            t={t}
            components={{
              switchTab: (
                <InlineButton
                  className={styles.errorButton}
                  onClick={() => {
                    setPrivateKeyValue(seedValue);
                    setShowValidationError(false);
                    setActiveTab(PRIVATE_KEY_TAB_INDEX);
                  }}
                />
              ),
            }}
          />,
        );
      } else {
        setIsAddressInProgress(true);

        createPrivateKey(utf8Encode(trimmedSeedValue))
          .then(createPublicKey)
          .then(publicKey => {
            const newAddress = base58Encode(
              createAddress(publicKey, networkCode.charCodeAt(0)),
            );

            validateAddress(newAddress);
            setAddress(newAddress);
          })
          .finally(() => {
            setIsAddressInProgress(false);
          });
      }
    } else if (activeTab === ENCODED_SEED_TAB_INDEX) {
      if (!encodedSeedValue) {
        setValidationError(t('importSeed.requiredError'));
      } else {
        const unprefixed = stripBase58Prefix(encodedSeedValue);

        if (!isBase58(unprefixed)) {
          setValidationError(t('importSeed.base58DecodeError'));
        } else if (unprefixed.length < ENCODED_SEED_MIN_LENGTH) {
          setValidationError(
            t('importSeed.encodedSeedLengthError', {
              minLength: ENCODED_SEED_MIN_LENGTH,
            }),
          );
        } else {
          setIsAddressInProgress(true);

          createPrivateKey(base58Decode(unprefixed))
            .then(createPublicKey)
            .then(publicKey => {
              const newAddress = base58Encode(
                createAddress(publicKey, networkCode.charCodeAt(0)),
              );

              validateAddress(newAddress);
              setAddress(newAddress);
            })
            .finally(() => {
              setIsAddressInProgress(false);
            });
        }
      }
    } else if (activeTab === PRIVATE_KEY_TAB_INDEX) {
      if (!privateKeyValue) {
        setValidationError(t('importSeed.requiredError'));
      } else if (
        privateKeyValue.startsWith('base58:') &&
        isBase58(stripBase58Prefix(privateKeyValue))
      ) {
        setValidationError(
          <Trans
            i18nKey="importSeed.base58PrefixError"
            t={t}
            components={{ switchTab: base58PrefixErrorSwitchTabButton }}
          />,
        );
      } else if (!isBase58(privateKeyValue)) {
        setValidationError(t('importSeed.base58DecodeError'));
      } else {
        const privateKey = base58Decode(privateKeyValue);

        if (privateKey.length !== 32) {
          setValidationError(
            t('importSeed.invalidPrivateKeyLengthError', { length: 32 }),
          );
        } else {
          setIsAddressInProgress(true);

          createPublicKey(privateKey)
            .then(publicKey => {
              const newAddress = base58Encode(
                createAddress(publicKey, networkCode.charCodeAt(0)),
              );

              validateAddress(newAddress);
              setAddress(newAddress);
            })
            .finally(() => {
              setIsAddressInProgress(false);
            });
        }
      }
    }
  }, [
    activeTab,
    encodedSeedValue,
    findExistingAccount,
    networkCode,
    privateKeyValue,
    seedValue,
    t,
  ]);

  const existingAccount = findExistingAccount(address);

  return (
    <div className={styles.content}>
      <div className={styles.titleBlock}>
        <h2 className="title1 margin3 left">{t('importSeed.title')}</h2>
      </div>

      <form
        onSubmit={event => {
          event.preventDefault();

          if (isAddressInProgress) {
            return;
          }

          if (showValidationError && existingAccount) {
            dispatch(selectAccount(existingAccount));
            navigate('/import-success');
            return;
          }

          setShowValidationError(true);

          if (validationError) {
            return;
          }

          invariant(address);

          if (activeTab === SEED_TAB_INDEX) {
            dispatch(
              newAccountSelect({
                type: 'seed',
                seed: seedValue,
                address,
                name: '',
                hasBackup: true,
              }),
            );
          } else if (activeTab === ENCODED_SEED_TAB_INDEX) {
            dispatch(
              newAccountSelect({
                type: 'encodedSeed',
                encodedSeed: encodedSeedValue,
                address,
                name: '',
                hasBackup: true,
              }),
            );
          } else {
            dispatch(
              newAccountSelect({
                type: 'privateKey',
                privateKey: privateKeyValue,
                address,
                name: '',
                hasBackup: true,
              }),
            );
          }

          navigate('/account-name');
        }}
      >
        <Tabs
          activeTab={activeTab}
          onTabChange={newActiveTab => {
            setShowValidationError(false);
            setActiveTab(newActiveTab);
          }}
        >
          <TabList>
            <Tab>{t('importSeed.plainText')}</Tab>
            <Tab>{t('importSeed.encodedSeed')}</Tab>
            <Tab>{t('importSeed.privateKey')}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <div className={styles.inputLabel}>
                {t('importSeed.plainTextPlaceholder')}
              </div>
              <Input
                autoFocus
                className={clsx('margin-main-top', styles.inputFullWidth)}
                data-testid="seedInput"
                error={validationError != null && showValidationError}
                multiLine
                rows={3}
                spellCheck={false}
                value={seedValue}
                onChange={event => {
                  setSeedValue(event.target.value);
                }}
              />
            </TabPanel>

            <TabPanel>
              <Input
                autoFocus
                className={clsx('margin-main-top', styles.inputFullWidth)}
                error={validationError != null && showValidationError}
                multiLine
                rows={3}
                spellCheck={false}
                value={encodedSeedValue}
                onChange={event => {
                  setEncodedSeedValue(event.target.value);
                }}
              />
            </TabPanel>

            <TabPanel>
              <Input
                autoFocus
                className={clsx('margin-main-top', styles.inputFullWidth)}
                error={validationError != null && showValidationError}
                multiLine
                rows={3}
                spellCheck={false}
                value={privateKeyValue}
                onChange={event => {
                  setPrivateKeyValue(event.target.value);
                }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <ErrorMessage
          className={styles.error}
          data-testid="validationError"
          show={showValidationError}
        >
          {validationError}
        </ErrorMessage>

        <div className="tag1 basic500 input-title">
          {t('importSeed.address')}
        </div>

        <div className={styles.addressWrapper}>
          <div
            className={clsx(styles.greyLine, 'grey-line')}
            data-testid="address"
          >
            {address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#0055FF', fontSize: 12 }}>◆</span>
                <span style={{ fontFamily: 'monospace', fontSize: 10 }}>
                  {address}
                </span>
              </div>
            )}
          </div>
        </div>

        <Button data-testid="continueBtn" type="submit" view="submit">
          {t(
            existingAccount && showValidationError
              ? 'importSeed.switchAccount'
              : 'importSeed.importAccount',
          )}
        </Button>
      </form>
    </div>
  );
}

export { ImportSeedWaves as ImportSeed };

export function ImportChooseAccountType() {
  const navigate = useNavigate();
  return (
    <div className={styles.content}>
      <div className={styles.chooseTypeTitle}>Choose account type</div>
      <div className={styles.separatorBtns}>
        <Button
          view="submit"
          onClick={() => navigate('/import-seed/multichain')}
        >
          Import multichain account
        </Button>
        <Button view="simple" onClick={() => navigate('/import-seed/waves')}>
          Import Waves account
        </Button>
      </div>
    </div>
  );
}

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

  const networkConfig = NETWORKS.find(n => n.network === 'waves');
  const profileConfig = networkConfig?.params[currentNetwork as NetworkProfile];
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
    const found = accounts.find(acc => {
      if (acc.accountType === 'multichain') {
        return acc.accounts?.waves?.address === addressWaves;
      }
      return acc.address === addressWaves;
    });
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
      const waves = await getWavesData(
        normalizedSeed,
        networkCode.charCodeAt(0),
      );
      const ethereum = getEthereumData(normalizedSeed);
      if (!ethereum.address) {
        setError('Invalid seed');
      }
      setAddressWaves(waves.address);
      setAddressEvm(ethereum.address);
      addressWavesRef.current = waves.address;
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
        type: 'seed',
        accountType: 'multichain',
        seed,
        address: addressWavesRef.current || addressWaves,
        addressEvm: addressEvmRef.current || addressEvm,
        name: nameRef.current,
        hasBackup: true,
      }),
    );
    navigate('/account-name');
  }

  return (
    <div className={styles.content}>
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
                width: '90%',
                paddingLeft: '2.7rem',
              }}
            >
              {addressWaves && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  <span style={{ fontFamily: 'monospace', fontSize: 10 }}>
                    {addressWaves}
                  </span>
                </div>
              )}
              {addressEvm && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
