import { useAccountsDispatch, useAccountsSelector } from 'accounts/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { newAccountSelect } from 'store/actions/localState';
import { CONFIG } from 'ui/appConfig';

import { createMultichainAccount, type MultichainAccount } from '../../../units/createMultichainAccount';
import { Button, ErrorMessage, Input } from '../ui';
import * as styles from './newWalletName.module.css';

export function CreateMultichainAccount() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAccountsDispatch();

  const accounts = useAccountsSelector(state => state.accounts);
  const [accountName, setAccountName] = useState('');
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>('');
  const [multichainData, setMultichainData] = useState<{
    account: MultichainAccount;
    phrase: string;
  } | null>(null);

  // Generate multichain account data on component mount
  useEffect(() => {
    const generateAccount = async () => {
      try {
        const data = await createMultichainAccount();
        setMultichainData(data);
      } catch (err) {
        setError('Failed to generate multichain account');
        console.error('Error generating multichain account:', err);
      }
    };

    generateAccount();
  }, []);

  useEffect(() => {
    setError(null);

    if (accountName.length < CONFIG.NAME_MIN_LENGTH) {
      setError(t('newAccountName.errorRequired'));
    }

    // Check if account name already exists
    if (accounts.find(({ name }) => name === accountName)) {
      setError(t('newAccountName.errorInUse'));
    }
  }, [accountName, accounts, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!multichainData || error || !accountName) {
      return;
    }

    setPending(true);

    try {
      // Set the account data in Redux store for the next step
      dispatch(
        newAccountSelect({
          type: 'multichain',
          address: multichainData.account.accounts.waves.address,
          ethereumAddress: multichainData.account.accounts.ethereum.address,
          name: accountName,
          accountType: 'multichain',
          seed: multichainData.phrase,
        }),
      );

      // Navigate to backup seed phrase page
      navigate('/create-account/save-backup');
    } catch (err) {
      setError('Failed to create multichain account');
      console.error('Error creating multichain account:', err);
    } finally {
      setPending(false);
    }
  };

  if (!multichainData) {
    return (
      <div className={styles.content}>
        <h2 className="title1 margin1">Generating Multichain Account...</h2>
        <p>Please wait while we generate your multichain account.</p>
      </div>
    );
  }

  return (
    <div data-testid="createMultichainAccountForm" className={styles.content}>
      <h2 className="title1 margin1">{t('newAccountName.accountName')}</h2>

      <form onSubmit={handleSubmit}>
        <div className="margin1">
          <Input
            data-testid="multichainAccountNameInput"
            className="margin1"
            onChange={event => {
              setAccountName(event.target.value);
            }}
            value={accountName}
            maxLength={32}
            autoFocus
            error={!!error}
            placeholder="Enter account name"
          />
          <ErrorMessage data-testid="multichainAccountNameError" show={!!error}>
            {error}
          </ErrorMessage>
        </div>

        <div className="basic500 tag1 margin2">
          This will create a multichain account that works across Waves, Ethereum, and Unit0 networks.
        </div>

        <div className={styles.footer}>
          <div className="tag1 basic500 input-title">Account Addresses</div>

          <div className="margin1">
            <div className="tag1 basic500">Waves:</div>
            <div className={`${styles.greyLine} grey-line`}>
              {multichainData.account.accounts.waves.address}
            </div>
          </div>

          <div className="margin1">
            <div className="tag1 basic500">Ethereum:</div>
            <div className={`${styles.greyLine} grey-line`}>
              {multichainData.account.accounts.ethereum.address}
            </div>
          </div>

          <div className="margin1">
            <div className="tag1 basic500">Unit0 Mainnet:</div>
            <div className={`${styles.greyLine} grey-line`}>
              {multichainData.account.accounts.unit0.mainnet.address}
            </div>
          </div>

          <div className="margin1">
            <div className="tag1 basic500">Unit0 Testnet:</div>
            <div className={`${styles.greyLine} grey-line`}>
              {multichainData.account.accounts.unit0.testnet.address}
            </div>
          </div>

          <Button
            data-testid="continueBtn"
            id="continue"
            type="submit"
            view="submit"
            disabled={!accountName || !!error || pending}
          >
            {pending ? 'Creating...' : t('newAccountName.continue')}
          </Button>
        </div>
      </form>
    </div>
  );
}
