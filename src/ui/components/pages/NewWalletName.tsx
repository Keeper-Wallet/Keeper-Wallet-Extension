import * as styles from './newWalletName.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { newAccountName, selectAccount } from 'ui/actions/localState';
import { useNavigate } from 'ui/router';
import { createAccount } from 'ui/actions/user';
import { Button, Error, Input } from 'ui/components/ui';
import { CONFIG } from 'ui/appConfig';
import { WalletTypes } from 'ui/services/Background';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';
import { PAGES } from 'ui/pageConfig';

export function NewWalletName() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const account = useAccountsSelector(state => state.localState.newAccount);
  const accounts = useAccountsSelector(state => state.accounts);
  const [accountName, setAccountName] = React.useState('');
  const [pending, setPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>('');

  const existingAccount = accounts.find(
    ({ address }) => address === account.address
  );

  React.useEffect(() => {
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
        })
      );
    }
  }, [accountName, accounts, existingAccount, dispatch, t]);

  return (
    <div data-testid="newWalletNameForm" className={styles.content}>
      <h2 className={`title1 margin1`}>{t('newAccountName.accountName')}</h2>

      <form
        onSubmit={async e => {
          e.preventDefault();

          setPending(true);

          if (existingAccount) {
            dispatch(selectAccount(existingAccount));
            navigate(PAGES.IMPORT_SUCCESS);
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
            createAccount(account, accountTypeToWalletType[account.type])
          );

          navigate(PAGES.IMPORT_SUCCESS);
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
          <Error data-testid="newAccountNameError" show={!!error}>
            {error}
          </Error>
        </div>

        <div className={`basic500 tag1 margin2`}>
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
                  navigate(PAGES.IMPORT_TAB, { replace: true });
                }}
              >
                {t('newAccountName.cancel')}
              </Button>
            </>
          ) : (
            <Button
              data-testid="continueBtn"
              className={styles.continueBtn}
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
