import * as libCrypto from '@waves/ts-lib-crypto';
import cn from 'classnames';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { newAccountSelect } from '../../actions';
import {
  Button,
  Error,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '../ui';
import { PAGES } from '../../pageConfig';
import * as styles from './importSeed.module.css';

interface Props {
  isNew?: boolean;
  setTab: (newTab: string) => void;
}

const SEED_MIN_LENGTH = 24;
const ENCODED_SEED_MIN_LENGTH = 16;

const SEED_TAB_INDEX = 0;
const ENCODED_SEED_TAB_INDEX = 1;
const PRIVATE_KEY_TAB_INDEX = 2;

function isValidBase58(str: string) {
  try {
    libCrypto.base58Decode(str);
    return true;
  } catch {
    return false;
  }
}

function stripBase58Prefix(str: string) {
  return str.replace(/^base58:/, '');
}

export function ImportSeed({ isNew, setTab }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const accounts = useAppSelector(state => state.accounts);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);
  const newAccount = useAppSelector(state => state.localState.newAccount);

  const [activeTab, setActiveTab] = React.useState(
    isNew || newAccount.type === 'seed'
      ? SEED_TAB_INDEX
      : newAccount.type === 'encodedSeed'
      ? ENCODED_SEED_TAB_INDEX
      : PRIVATE_KEY_TAB_INDEX
  );

  const [showValidationError, setShowValidationError] = React.useState(false);

  const [seedValue, setSeedValue] = React.useState<string>(
    isNew || newAccount.type !== 'seed' ? '' : newAccount.seed
  );

  const [encodedSeedValue, setEncodedSeedValue] = React.useState<string>(
    isNew || newAccount.type !== 'encodedSeed' ? '' : newAccount.encodedSeed
  );

  const [privateKeyValue, setPrivateKeyValue] = React.useState<string>(
    isNew || newAccount.type !== 'privateKey' ? '' : newAccount.privateKey
  );

  const networkCode =
    customCodes[currentNetwork] ||
    networks.find(n => currentNetwork === n.name).code;

  let address: string | null = null;
  let validationError: React.ReactElement | string | null = null;

  function switchToEncodedTabFromError() {
    let newEncodedSeedValue = '';

    if (activeTab === SEED_TAB_INDEX) {
      newEncodedSeedValue = seedValue;
    } else if (activeTab === PRIVATE_KEY_TAB_INDEX) {
      newEncodedSeedValue = privateKeyValue;
    }

    setEncodedSeedValue(newEncodedSeedValue);
    setShowValidationError(false);
    setActiveTab(ENCODED_SEED_TAB_INDEX);
  }

  const errorSwitchTabElement = (
    <span
      className={styles.errorSwitchTab}
      role="button"
      tabIndex={0}
      onClick={() => {
        switchToEncodedTabFromError();
      }}
      onKeyUp={event => {
        if (['Enter', ' '].includes(event.key)) {
          switchToEncodedTabFromError();
        }
      }}
    />
  );

  if (activeTab === SEED_TAB_INDEX) {
    if (!seedValue) {
      validationError = t('importSeed.requiredError');
    } else if (seedValue.length < SEED_MIN_LENGTH) {
      validationError = t('importSeed.seedLengthError', {
        minLength: SEED_MIN_LENGTH,
      });
    } else if (
      seedValue.startsWith('base58:') &&
      isValidBase58(stripBase58Prefix(seedValue))
    ) {
      validationError = (
        <Trans
          i18nKey="importSeed.base58PrefixError"
          components={{
            switchTab: errorSwitchTabElement,
          }}
        />
      );
    } else {
      address = libCrypto.address(seedValue.trim(), networkCode);
    }
  } else if (activeTab === ENCODED_SEED_TAB_INDEX) {
    if (!encodedSeedValue) {
      validationError = t('importSeed.requiredError');
    } else {
      const unprefixed = encodedSeedValue.replace(/^base58:/, '');

      if (!isValidBase58(unprefixed)) {
        validationError = t('importSeed.base58DecodeError');
      } else if (unprefixed.length < ENCODED_SEED_MIN_LENGTH) {
        validationError = t('importSeed.encodedSeedLengthError', {
          minLength: ENCODED_SEED_MIN_LENGTH,
        });
      } else {
        address = libCrypto.address(
          libCrypto.base58Decode(unprefixed),
          networkCode
        );
      }
    }
  } else if (activeTab === PRIVATE_KEY_TAB_INDEX) {
    if (!privateKeyValue) {
      validationError = t('importSeed.requiredError');
    } else if (
      privateKeyValue.startsWith('base58:') &&
      isValidBase58(stripBase58Prefix(privateKeyValue))
    ) {
      validationError = (
        <Trans
          i18nKey="importSeed.base58PrefixError"
          components={{
            switchTab: errorSwitchTabElement,
          }}
        />
      );
    } else if (!isValidBase58(privateKeyValue)) {
      validationError = t('importSeed.base58DecodeError');
    } else {
      const privateKey = libCrypto.base58Decode(privateKeyValue);

      if (privateKey.length !== libCrypto.PRIVATE_KEY_LENGTH) {
        validationError = t('importSeed.invalidPrivateKeyLengthError', {
          length: libCrypto.PRIVATE_KEY_LENGTH,
        });
      } else {
        const publicKey = libCrypto.publicKey({ privateKey });
        address = libCrypto.address({ publicKey }, networkCode);
      }
    }
  }

  if (address && accounts.some(acc => acc.address === address)) {
    validationError = t('importSeed.accountExistsError');
  }

  return (
    <div className={styles.content}>
      <div>
        <h2 className="title1 margin3 left">
          <Trans i18nKey="importSeed.title" />
        </h2>
      </div>

      <form
        onSubmit={event => {
          event.preventDefault();

          setShowValidationError(true);

          if (validationError) {
            return;
          }

          if (activeTab === SEED_TAB_INDEX) {
            dispatch(
              newAccountSelect({
                type: 'seed',
                seed: seedValue,
                name: '',
                hasBackup: true,
              })
            );
          } else if (activeTab === ENCODED_SEED_TAB_INDEX) {
            dispatch(
              newAccountSelect({
                type: 'encodedSeed',
                encodedSeed: encodedSeedValue,
                name: '',
                hasBackup: true,
              })
            );
          } else {
            dispatch(
              newAccountSelect({
                type: 'privateKey',
                privateKey: privateKeyValue,
                name: '',
                hasBackup: true,
              })
            );
          }

          setTab(PAGES.ACCOUNT_NAME_SEED);
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
            <Tab>
              <Trans i18nKey="importSeed.plainText" />
            </Tab>

            <Tab>
              <Trans i18nKey="importSeed.encodedSeed" />
            </Tab>

            <Tab>
              <Trans i18nKey="importSeed.privateKey" />
            </Tab>
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

        <Error
          className={styles.error}
          data-testid="validationError"
          show={showValidationError}
        >
          {validationError}
        </Error>

        <div className="tag1 basic500 input-title">
          <Trans i18nKey="importSeed.address" />
        </div>

        <div className={cn(styles.greyLine, 'grey-line')} data-testid="address">
          {address}
        </div>

        <Button id="importAccount" type="submit" view="submit">
          <Trans i18nKey="importSeed.importAccount" />
        </Button>
      </form>
    </div>
  );
}
