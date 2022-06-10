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

  const [showErrors, setShowErrors] = React.useState<boolean>(false);

  const [name, setName] = React.useState<string>();
  const [nameErr, setNameErr] = React.useState<string>();
  const [address, setAddress] = React.useState<string>();
  const [addressErr, setAddressErr] = React.useState<string>();

  React.useEffect(() => {
    setNameErr(t('importDebug.requiredError'));

    if (name != null) {
      setNameErr(null);

      if (accounts.some(account => account.name === name)) {
        setNameErr(t('importDebug.alreadyExists'));
      }
    }

    setAddressErr(t('importDebug.requiredError'));

    if (address != null) {
      setAddressErr(null);

      if (!validators.isValidAddress(address, networkCode.charCodeAt(0))) {
        setAddressErr(
          t('importDebug.invalidAddressError', {
            values: { networkName: currentNetwork },
          })
        );
      }

      if (accounts.some(account => account.address === address)) {
        setAddressErr(t('importDebug.alreadyExists'));
      }
    }
  }, [name, address, currentNetwork, networkCode, accounts, dispatch, t]);

  return (
    <div className={styles.content}>
      <h2 className="margin1 title1">{t('importDebug.title')}</h2>

      <form
        onSubmit={e => {
          e.preventDefault();

          setShowErrors(true);

          if (nameErr || addressErr) {
            return;
          }

          dispatch(
            createAccount(
              {
                type: WalletTypes.Debug,
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
            value={name ?? ''}
            maxLength={32}
            autoFocus
            error={showErrors && !!nameErr}
          />
          <Error show={showErrors && !!nameErr}>{nameErr}</Error>
        </div>

        <div className="margin4">
          <label className="input-title basic500 tag1" htmlFor="accountAddress">
            {t('importDebug.addressInput')}
          </label>
          <Input
            id="accountAddress"
            className="margin1"
            onChange={e => setAddress(e.target.value)}
            value={address ?? ''}
            maxLength={35}
            error={showErrors && !!addressErr}
          />
          <Error show={showErrors && !!addressErr}>{addressErr}</Error>
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
