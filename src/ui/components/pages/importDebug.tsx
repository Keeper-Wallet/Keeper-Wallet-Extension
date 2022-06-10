import { validators } from '@waves/waves-transactions';
import { useAppDispatch, useAppSelector } from 'ui/store';
import * as React from 'react';
import { createAccount } from 'ui/actions';
import { WalletTypes } from 'ui/services/Background';
import { Button, Error, Input } from 'ui/components/ui';
import * as styles from 'ui/components/pages/importDebug.module.css';
import { useTranslation } from 'react-i18next';

export function ImportDebug() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);
  const networkCode =
    customCodes[currentNetwork] ||
    networks.find(n => currentNetwork === n.name).code;

  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');

  const nameError = React.useMemo(() => {
    if (!name) {
      return t('importDebug.requiredError');
    } else {
      if (accounts.some(account => account.name === name)) {
        return t('importDebug.alreadyExists');
      }
    }

    return null;
  }, [name, accounts, t]);

  const addressError = React.useMemo(() => {
    if (!address) {
      return t('importDebug.requiredError');
    } else {
      if (!validators.isValidAddress(address, networkCode.charCodeAt(0))) {
        return t('importDebug.invalidAddressError', {
          values: { networkName: currentNetwork },
        });
      }

      if (accounts.some(account => account.address === address)) {
        return t('importDebug.alreadyExists');
      }
    }

    return null;
  }, [address, accounts, currentNetwork, networkCode, t]);

  const [showErrors, setShowErrors] = React.useState<boolean>(false);

  return (
    <div className={styles.content}>
      <h2 className="margin1 title1">{t('importDebug.title')}</h2>

      <form
        onSubmit={e => {
          e.preventDefault();

          setShowErrors(true);

          if (nameError || addressError) {
            return;
          }

          dispatch(
            createAccount(
              {
                type: 'debug',
                address,
                name,
                networkCode,
              },
              WalletTypes.Debug
            )
          );
        }}
      >
        <div className="margin1">
          <label className="input-title basic500 tag1" htmlFor="accountName">
            {t('importDebug.nameInput')}
          </label>
          <Input
            id="accountName"
            className="margin1"
            onChange={e => setName(e.target.value)}
            value={name}
            maxLength={32}
            autoFocus
            error={showErrors && !!nameError}
          />
          <Error show={showErrors && !!nameError}>{nameError}</Error>
        </div>

        <div className="margin4">
          <label className="input-title basic500 tag1" htmlFor="accountAddress">
            {t('importDebug.addressInput')}
          </label>
          <Input
            id="accountAddress"
            className="margin1"
            onChange={e => setAddress(e.target.value)}
            value={address}
            maxLength={35}
            error={showErrors && !!addressError}
          />
          <Error show={showErrors && !!addressError}>{addressError}</Error>
        </div>

        <div className="margin4">
          <Button
            data-testid="continueBtn"
            className={styles.continueBtn}
            id="continue"
            type="submit"
            view="submit"
          >
            {t('importDebug.continueBtn')}
          </Button>
        </div>
      </form>
    </div>
  );
}
