import { validators } from '@waves/waves-transactions';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createAccount } from 'ui/actions/user';
import * as styles from 'ui/components/pages/importDebug.module.css';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import { WalletTypes } from 'ui/services/Background';
import { useAppDispatch, useAppSelector } from 'ui/store';

export function ImportDebug() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);
  const networkCode =
    customCodes[currentNetwork] ||
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    networks.find(n => currentNetwork === n.name)!.code;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const nameError = useMemo(() => {
    if (!name) {
      return t('importDebug.requiredError');
    }

    if (accounts.some(account => account.name === name)) {
      return t('importDebug.alreadyExists');
    }

    return null;
  }, [name, accounts, t]);

  const addressError = useMemo(() => {
    if (!address) {
      return t('importDebug.requiredError');
    }

    if (!validators.isValidAddress(address, networkCode.charCodeAt(0))) {
      return t('importDebug.invalidAddressError', {
        networkName: currentNetwork,
      });
    }

    if (accounts.some(account => account.address === address)) {
      return t('importDebug.alreadyExists');
    }

    return null;
  }, [address, accounts, currentNetwork, networkCode, t]);

  const [showErrors, setShowErrors] = useState<boolean>(false);

  return (
    <div className={styles.content}>
      <h2 className="margin1 title1">{t('importDebug.title')}</h2>

      <form
        onSubmit={async e => {
          e.preventDefault();

          setShowErrors(true);

          if (nameError || addressError) {
            return;
          }

          await dispatch(
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

          navigate('/import-success');
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
          <ErrorMessage show={showErrors && !!nameError}>
            {nameError}
          </ErrorMessage>
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
          <ErrorMessage show={showErrors && !!addressError}>
            {addressError}
          </ErrorMessage>
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
