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
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect, selectAccount } from 'store/actions/localState';
import invariant from 'tiny-invariant';

import { NETWORK_CONFIG } from '../../../constants';
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

export function ImportSeed() {
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

  const networkCode =
    customCodes[currentNetwork] || NETWORK_CONFIG[currentNetwork].networkCode;

  const [address, setAddress] = useState<string>();

  const [validationError, setValidationError] = useState<
    React.ReactElement | string
  >();

  const findExistingAccount = useCallback(
    (addr: string | undefined) =>
      addr && accounts.find(acc => acc.address === addr),
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
      <div>
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
              <Input
                autoFocus
                className="margin-main-top"
                data-testid="seedInput"
                error={validationError != null && showValidationError}
                multiLine
                placeholder={t('importSeed.plainTextPlaceholder')}
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
                className="margin-main-top"
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
                className="margin-main-top"
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

        <div
          className={clsx(styles.greyLine, 'grey-line')}
          data-testid="address"
        >
          {address}
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
