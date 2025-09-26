import { useAccountsDispatch, useAccountsSelector } from 'accounts/store/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectAccount } from 'store/actions/localState';
import {
  createMultiWalletWithFactory,
  createWavesOnlyMultiWallet,
} from 'store/actions/user';
import { Button, ErrorMessage, Input } from 'ui/components/ui';

import { useWalletValidation } from '../../hooks/useWalletValidation';
import * as styles from './newWalletName.module.css';

export function NewWalletName() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAccountsDispatch();
  const location = useLocation();

  const account = useAccountsSelector(state => state.localState.newAccount);
  const accounts = useAccountsSelector(state => state.accounts);

  const [accountName, setAccountName] = useState('');
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>('');

  // NEW: Use validation service instead of manual checks
  const { validateWalletName } = useWalletValidation();

  const existingAccount = accounts.find(
    ({ address }) => address === account.address,
  );

  // Check if we're creating a Waves-only account or multichain account
  const isMultichainFromState = location.state?.multichain === true;
  const isPrivateKey = account.type === 'privateKey';
  const isWavesOnlyCreation = account.type === 'seed' && !isMultichainFromState;
  const isMultichainCreation =
    account.type === 'multichain' || isMultichainFromState;

  const validateName = useCallback(
    async (name: string) => {
      if (!name) {
        setError(null);
        return;
      }

      const validation = await validateWalletName(name);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid name');
      } else {
        setError(null);
      }
    },
    [validateWalletName],
  );

  useEffect(() => {
    if (existingAccount) {
      setError(
        t('newAccountName.errorAlreadyExists', {
          name: existingAccount.name,
        }),
      );
      return;
    }

    validateName(accountName);
  }, [accountName, existingAccount, t, validateName]);

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
          if (isWavesOnlyCreation) {
            try {
              // Use the new MultiWallet approach for Waves-only creation
              // This creates a nested structure with all three Waves networks
              await dispatch(
                createWavesOnlyMultiWallet({
                  name: accountName,
                  seed: account.seed,
                  type: account.type,
                }),
              );
            } catch (error) {
              console.trace('Failed to create Waves-only MultiWallet:', error);
              setError('Failed to create wallet. Please try again.');
              setPending(false);
              return;
            }
          } else if (isMultichainCreation) {
            // Use our new factory-based action for multichain accounts
            // Generate new seed if coming from URL parameter (no existing seed)
            const seedToUse: string =
              'seed' in account && account.seed && account.seed.trim()
                ? account.seed
                : await import('ethers').then(
                    ({ Mnemonic }) =>
                      Mnemonic.fromEntropy(
                        crypto.getRandomValues(new Uint8Array(16)),
                      ).phrase,
                  );

            await dispatch(
              createMultiWalletWithFactory({
                name: accountName,
                seed: seedToUse,
              }),
            );
          } else if (isPrivateKey) {
            await dispatch(
              createWavesOnlyMultiWallet({
                name: accountName,
                privateKey: account.privateKey,
                type: account.type,
              }),
            );
          }

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
          {isMultichainCreation
            ? 'This will create accounts on Waves (Mainnet, Testnet, Stagenet) and Unit0 (Mainnet, Testnet). All accounts include Ethereum access with the same shared address.'
            : isWavesOnlyCreation
            ? 'This will create the same account on Waves Mainnet, Testnet, and Stagenet.'
            : t('newAccountName.nameInfo')}
        </div>

        <div className={styles.footer}>
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
