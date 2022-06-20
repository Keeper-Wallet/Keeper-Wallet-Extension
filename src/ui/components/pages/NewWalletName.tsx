import * as styles from './newWalletName.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  createAccount,
  newAccountName,
  selectAccount,
  setTab as resetTab,
} from 'ui/actions';
import { Button, Error, Input } from 'ui/components/ui';
import { CONFIG } from 'ui/appConfig';
import { WalletTypes } from 'ui/services/Background';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';
import { PAGES } from 'ui/pageConfig';

export function NewWalletName({ setTab }: { setTab: (tab: string) => void }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const account = useAccountsSelector(state => state.localState.newAccount);
  const accounts = useAccountsSelector(state => state.accounts);
  const [accountName, setAccountName] = React.useState<string>();
  const [pending, setPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const existedAccount = accounts.find(
    ({ address }) => address === account.address
  );

  React.useEffect(() => {
    dispatch(newAccountName(accountName));

    if (accountName != null) {
      setError(null);

      if (accountName.length < CONFIG.NAME_MIN_LENGTH) {
        setError(t('newAccountName.errorRequired'));
      }

      if (accounts.find(({ name }) => name === accountName)) {
        setError(t('newAccountName.errorInUse'));
      }
    }

    if (existedAccount) {
      setError(
        t('newAccountName.errorAlreadyExists', {
          name: existedAccount.name,
        })
      );
    }
  }, [accountName, accounts, existedAccount, dispatch, t]);

  return (
    <div data-testid="newWalletNameForm" className={styles.content}>
      <h2 className={`title1 margin1`}>{t('newAccountName.accountName')}</h2>

      <form
        onSubmit={e => {
          e.preventDefault();

          setPending(true);

          if (existedAccount) {
            dispatch(selectAccount(existedAccount));
            return setTab(PAGES.IMPORT_SUCCESS);
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

          dispatch(
            createAccount(account, accountTypeToWalletType[account.type])
          );
        }}
      >
        <div className={`margin1`}>
          <Input
            data-testid="newAccountNameInput"
            className="margin1"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAccountName(e.target.value)
            }
            value={accountName ?? ''}
            maxLength={32}
            disabled={!!existedAccount}
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
          <div className={`tag1 basic500 input-title`}>
            {t('newAccountName.accountAddress')}
          </div>

          <div className={`${styles.greyLine} grey-line`}>
            {account.address}
          </div>

          {existedAccount ? (
            <>
              <Button className="margin2" type="submit">
                {t('newAccountName.switchAccount')}
              </Button>

              <Button
                className="margin1"
                type="button"
                onClick={() => dispatch(resetTab(PAGES.ROOT))}
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
