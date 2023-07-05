import { useAccountsDispatch, useAccountsSelector } from 'accounts/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { newAccountName, selectAccount } from 'store/actions/localState';
import { createAccount } from 'store/actions/user';
import { CONFIG } from 'ui/appConfig';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import { WalletTypes } from 'ui/services/Background';

import * as styles from './newWalletName.module.css';

export function NewWalletName() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAccountsDispatch();

  const account = useAccountsSelector(state => state.localState.newAccount);
  const accounts = useAccountsSelector(state => state.accounts);
  const [accountName, setAccountName] = useState('');
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>('');

  const existingAccount = accounts.find(
    ({ address }) => address === account.address,
  );

  useEffect(() => {
    dispatch(newAccountName(accountName));

    setError(null);

    if (accountName.length < CONFIG.NAME_MIN_LENGTH) {
      setError(t('newAccountName.errorRequired'));
    }

    if (accounts.find(({ name }) => name === accountName)) {
      setError(t('newAccountName.errorInUse'));
    }

    if (existingAccount) {
      setError(
        t('newAccountName.errorAlreadyExists', {
          name: existingAccount.name,
        }),
      );
    }
  }, [accountName, accounts, existingAccount, dispatch, t]);

  return (
    <div data-testid="newWalletNameForm" className={styles.content}>
      <h2 className="title1 margin1">{t('newAccountName.accountName')}</h2>

      <form
        onSubmit={async e => {
          e.preventDefault();

          setPending(true);

          if (existingAccount) {
            dispatch(selectAccount(existingAccount));
            navigate('/import-success');
            return;
          }

          if (error) {
            return;
          }

          const accountTypeToWalletType = {
            seed: WalletTypes.Seed,
            encodedSeed: WalletTypes.EncodedSeed,
            privateKey: WalletTypes.PrivateKey,
            wx: WalletTypes.Wx,
            ledger: WalletTypes.Ledger,
          };

          await dispatch(
            createAccount(account, accountTypeToWalletType[account.type]),
          );

          navigate('/import-success');
        }}
      >
        <div className="margin1">
          <Input
            data-testid="newAccountNameInput"
            className="margin1"
            onChange={event => {
              setAccountName(event.target.value);
            }}
            value={accountName}
            maxLength={32}
            disabled={!!existingAccount}
            autoFocus
            error={!!error}
          />
          <ErrorMessage data-testid="newAccountNameError" show={!!error}>
            {error}
          </ErrorMessage>
        </div>

        <div className="basic500 tag1 margin2">
          {t('newAccountName.nameInfo')}
        </div>

        <div className={styles.footer}>
          <div className="tag1 basic500 input-title">
            {t('newAccountName.accountAddress')}
          </div>

          <div className={`${styles.greyLine} grey-line`}>
            {account.address}
          </div>

          {existingAccount ? (
            <>
              <Button className="margin2" type="submit">
                {t('newAccountName.switchAccount')}
              </Button>

              <Button
                className="margin1"
                type="button"
                onClick={() => {
                  navigate('/', { replace: true });
                }}
              >
                {t('newAccountName.cancel')}
              </Button>
            </>
          ) : (
            <Button
              data-testid="continueBtn"
              id="continue"
              type="submit"
              view="submit"
              disabled={!accountName || !!error || pending}
            >
              {t('newAccountName.continue')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
