import { useAccountsDispatch, useAccountsSelector } from 'accounts/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { selectAccount } from 'store/actions/localState';
import { createAccount, batchAddAccounts } from 'store/actions/user';
import { CONFIG } from 'ui/appConfig';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import { WalletTypes } from 'ui/services/Background';
import { getUnit0Data } from 'units/ed25519';

import { NETWORK_CONFIG } from '../../../constants';
import { NetworkName } from '../../../networks/types';
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

  // Check if we're creating a Waves-only account or multichain account
  const isWavesOnlyCreation = account.type === 'seed';
  const isMultichainCreation = account.type === 'multichain';

  useEffect(() => {
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

          // If this is a multichain account creation, create accounts for all networks
          if (isMultichainCreation && account.type === 'multichain') {
            // Create Waves accounts (no ethereumAddress needed)
            const wavesAccounts = [
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                network: NetworkName.Mainnet,
                networkCode: NETWORK_CONFIG[NetworkName.Mainnet].networkCode, // 'W'
              },
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                network: NetworkName.Testnet,
                networkCode: NETWORK_CONFIG[NetworkName.Testnet].networkCode, // 'T'
              },
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                network: NetworkName.Stagenet,
                networkCode: NETWORK_CONFIG[NetworkName.Stagenet].networkCode, // 'S'
              },
            ];

            await dispatch(batchAddAccounts(wavesAccounts, WalletTypes.Seed));

            // Generate Unit0 account data
            const unit0MainnetData = await getUnit0Data(account.seed, 88811);
            const unit0TestnetData = await getUnit0Data(account.seed, 88817);

            // Create Unit0 accounts with ethereumAddress
            const unit0Accounts = [
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                address: unit0MainnetData.address,
                publicKey: unit0MainnetData.publicKey,
                network: NetworkName.Mainnet,
                networkCode: '88811',
                ethereumAddress: account.ethereumAddress,
              },
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                address: unit0TestnetData.address,
                publicKey: unit0TestnetData.publicKey,
                network: NetworkName.Testnet,
                networkCode: '88817',
                ethereumAddress: account.ethereumAddress,
              },
            ];
            // Create Unit0 accounts using batchAddAccounts (preserves custom networkCode)
            await dispatch(batchAddAccounts(unit0Accounts, WalletTypes.Seed));
          } else if (isWavesOnlyCreation) {
            // Waves-only account creation (existing logic)
            const wavesNetworks = [
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                network: NetworkName.Testnet,
                networkCode: NETWORK_CONFIG[NetworkName.Testnet].networkCode,
              },
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                network: NetworkName.Mainnet,
                networkCode: NETWORK_CONFIG[NetworkName.Mainnet].networkCode,
              },
              {
                name: accountName,
                type: 'seed' as const,
                seed: account.seed,
                network: NetworkName.Stagenet,
                networkCode: NETWORK_CONFIG[NetworkName.Stagenet].networkCode,
              },
            ];

            await dispatch(batchAddAccounts(wavesNetworks, WalletTypes.Seed));
          } else {
            // Normal single account creation
            await dispatch(
              createAccount(account, accountTypeToWalletType[account.type]),
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
            : t('newAccountName.nameInfo')
          }
        </div>

        <div className={styles.footer}>
          <div className="tag1 basic500 input-title">
            {t('newAccountName.accountAddress')}
          </div>

          <div className={`${styles.greyLine} grey-line`}>
            {account.address}
          </div>

          {isMultichainCreation && account.ethereumAddress && (
            <>
              <div className="tag1 basic500 input-title">Ethereum/Unit0</div>
              <div className={`${styles.greyLine} grey-line`}>
                {account.ethereumAddress}
              </div>
            </>
          )}

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
