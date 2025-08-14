import { useAccountsDispatch, useAccountsSelector } from 'accounts/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { selectAccount } from 'store/actions/localState';
import {
  createWavesOnlyMultiWallet,
  createFullMultiWallet,
} from 'store/actions/user';
import { CONFIG } from 'ui/appConfig';
import { Button, ErrorMessage, Input } from 'ui/components/ui';
import { getUnit0Data, getWavesData } from 'units/ed25519';
import { SeedWallet } from '../../../wallets/seed';

import { CHAIN_IDS, NETWORK_CONFIG } from '../../../constants';
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

  console.log(accounts, 'accounts');
  console.log(account, 'account');

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

          // const accountTypeToWalletType = {
          //   seed: WalletTypes.Seed,
          //   encodedSeed: WalletTypes.EncodedSeed,
          //   privateKey: WalletTypes.PrivateKey,
          //   wx: WalletTypes.Wx,
          //   ledger: WalletTypes.Ledger,
          // };


          if (isWavesOnlyCreation) {
            // Create Waves accounts using SeedWallet.create instead of getWavesData
            const mainnetWallet = await SeedWallet.create({
              name: accountName,
              network: NetworkName.Mainnet,
              networkCode: NETWORK_CONFIG[NetworkName.Mainnet].networkCode,
              seed: account.seed,
            });

            const testnetWallet = await SeedWallet.create({
              name: accountName,
              network: NetworkName.Testnet,
              networkCode: NETWORK_CONFIG[NetworkName.Testnet].networkCode,
              seed: account.seed,
            });

            const stagenetWallet = await SeedWallet.create({
              name: accountName,
              network: NetworkName.Stagenet,
              networkCode: NETWORK_CONFIG[NetworkName.Stagenet].networkCode,
              seed: account.seed,
            });

            // Extract the data we need from the wallet instances
            const mainnetData = {
              address: mainnetWallet.data.address,
              publicKey: mainnetWallet.data.publicKey,
            };

            const testnetData = {
              address: testnetWallet.data.address,
              publicKey: testnetWallet.data.publicKey,
            };

            const stagenetData = {
              address: stagenetWallet.data.address,
              publicKey: stagenetWallet.data.publicKey,
            };

            try {
              console.log('Generated Waves network addresses:', {
                mainnet: mainnetData,
                testnet: testnetData.address,
                stagenet: stagenetData.address,
                account: account,
              });

              // Use the new MultiWallet approach for Waves-only creation
              // This creates a nested structure with all three Waves networks
              await dispatch(
                createWavesOnlyMultiWallet({
                  name: accountName,
                  seed: account.seed,
                  mainnetAddress: mainnetData.address,
                  publicKey: mainnetData.publicKey,
                  testnetAddress: testnetData.address,
                  stagenetAddress: stagenetData.address,
                  type: account.type,
                }),
              );

              console.log(
                'Created Waves-only MultiWallet with name:',
                accountName,
              );
            } catch (error) {
              console.trace(
                'Failed to create Waves-only MultiWallet:',
                error,
              );
              setError('Failed to create wallet. Please try again.');
              setPending(false);
              return;
            }
          } else if (isMultichainCreation) {
            try {
              const mainnetData = await getWavesData(
                account.seed,
                CHAIN_IDS[NetworkName.Mainnet],
              );
              const testnetData = await getWavesData(
                account.seed,
                CHAIN_IDS[NetworkName.Testnet],
              );
              const stagenetData = await getWavesData(
                account.seed,
                CHAIN_IDS[NetworkName.Stagenet],
              );

              // Generate Unit0 account data for both mainnet and testnet
              const unit0Address = await getUnit0Data(account.seed);

              // Use the new createFullMultiWallet with simplified parameters
              await dispatch(
                createFullMultiWallet({
                  name: accountName,
                  seed: account.seed,
                  mainnetAddress: mainnetData.address,
                  publicKey: mainnetData.publicKey,
                  testnetAddress: testnetData.address,
                  stagenetAddress: stagenetData.address,
                  unit0Address: unit0Address.address,
                  unit0PublicKey: unit0Address.publicKey,
                  type: account.type,
                }),
              );

              console.log(
                'Created Full MultiWallet with name:',
                accountName,
              );
            } catch (error) {
              console.trace(
                'Failed to create Full MultiWallet:',
                error,
              );
              setError('Failed to create wallet. Please try again.');
              setPending(false);
              return;
            }
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
