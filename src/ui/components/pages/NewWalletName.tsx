import * as styles from 'ui/components/pages/newWalletName.module.css';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  createAccount,
  newAccountName,
  newAccountSelect,
  selectAccount,
  setTab as resetTab,
} from '../../actions';
import { Button, Error, Input } from '../ui';
import { CONFIG } from '../../appConfig';
import { WalletTypes } from '../../services/Background';
import * as libCrypto from '@waves/ts-lib-crypto';
import { useAppDispatch, useAppSelector } from 'accounts/store';
import { PAGES } from 'ui/pageConfig';

export function NewWalletName({ setTab }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const account = useAppSelector(state => state.localState.newAccount);
  const accounts = useAppSelector(state => state.accounts);
  const networkCode = useAppSelector(
    state =>
      state.customCodes[state.currentNetwork] ||
      state.networks.find(n => state.currentNetwork === n.name).code
  );
  const [accountName, setAccountName] = React.useState<string>('');
  const [pending, setPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [touched, setTouched] = React.useState<boolean>(false);

  const accountAddress =
    account.address || libCrypto.address(account.seed, networkCode);

  const existedAccount = accounts.find(
    ({ address }) => address === accountAddress
  );

  React.useEffect(() => {
    dispatch(newAccountName(accountName));

    if (touched) {
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
  }, [accountName, accounts]);

  return (
    <div className={styles.content}>
      <h2 className={`title1 margin1`}>
        <Trans i18nKey="newAccountName.accountName" />
      </h2>

      <form
        onSubmit={e => {
          e.preventDefault();

          setPending(true);

          if (existedAccount) {
            dispatch(newAccountSelect(existedAccount));
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
            onChange={e => setAccountName(e.target.value)}
            value={accountName}
            maxLength="32"
            disabled={existedAccount}
            autoFocus
            error={error}
            onFocus={() => setTouched(true)}
          />
          <Error show={!!error}>{error}</Error>
        </div>

        <div className={`basic500 tag1 margin2`}>
          <Trans i18nKey="newAccountName.nameInfo" />
        </div>

        <div className={styles.footer}>
          <div className={`tag1 basic500 input-title`}>
            <Trans i18nKey="newAccountName.accountAddress" />
          </div>

          <div className={`${styles.greyLine} grey-line`}>{accountAddress}</div>

          {existedAccount ? (
            <>
              <Button className="margin2" type="submit">
                <Trans i18nKey="newAccountName.switchAccount" />
              </Button>

              <Button
                className="margin1"
                type="button"
                onClick={() => dispatch(resetTab(PAGES.ROOT))}
              >
                <Trans i18nKey="newAccountName.cancel" />
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
              <Trans i18nKey="newAccountName.continue" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
