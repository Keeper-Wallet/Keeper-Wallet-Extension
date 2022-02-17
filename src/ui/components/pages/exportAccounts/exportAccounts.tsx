import * as React from 'react';
import { Account, KeystoreProfiles } from 'accounts/types';
import { useAppSelector } from 'ui/store';
import background from '../../../services/Background';
import { ExportKeystoreChooseAccounts } from './chooseAccounts';
import { ExportAccountsPasswordModal } from './passwordModal';
import { seedUtils } from '@waves/waves-transactions';

interface Props {
  onBack: () => void;
}

export function ExportAccounts({ onBack }: Props) {
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );

  const [accountsToExport, setAccountsToExport] = React.useState<
    Account[] | null
  >(null);

  return (
    <>
      <ExportKeystoreChooseAccounts
        accounts={allNetworksAccounts}
        onSubmit={selectedAccounts => {
          console.log(selectedAccounts);
          setAccountsToExport(selectedAccounts);
        }}
      />

      {accountsToExport != null && (
        <ExportAccountsPasswordModal
          onClose={() => {
            setAccountsToExport(null);
          }}
          onSubmit={async password => {
            const accounts = await Promise.all(
              accountsToExport.map(async acc => {
                const commonData = {
                  address: acc.address,
                  name: acc.name,
                  network: acc.network,
                  networkCode: acc.networkCode,
                };

                switch (acc.type) {
                  case 'seed':
                    return {
                      ...commonData,
                      type: acc.type,
                      seed: await background.getAccountSeed(
                        acc.address,
                        acc.network,
                        password
                      ),
                    };
                  case 'encodedSeed':
                    return {
                      ...commonData,
                      type: acc.type,
                      encodedSeed: await background.getAccountEncodedSeed(
                        acc.address,
                        acc.network,
                        password
                      ),
                    };
                  case 'privateKey':
                    return {
                      ...commonData,
                      type: acc.type,
                      privateKey: await background.getAccountPrivateKey(
                        acc.address,
                        acc.network,
                        password
                      ),
                    };
                }
              })
            );

            const profiles = accounts.reduce<KeystoreProfiles>(
              (result, { network, ...acc }) => {
                result[network].accounts.push(acc);

                return result;
              },
              {
                custom: { accounts: [] },
                mainnet: { accounts: [] },
                stagenet: { accounts: [] },
                testnet: { accounts: [] },
              }
            );

            const now = new Date();
            const pad = (zeroes: number, value: number) =>
              value.toString().padStart(zeroes, '0');
            const nowStr = `${pad(2, now.getFullYear() % 100)}${pad(
              2,
              now.getMonth() + 1
            )}${pad(2, now.getDate())}${pad(2, now.getHours())}${pad(
              2,
              now.getMinutes()
            )}`;

            const filename = `keystore-wkeeper-${nowStr}.json`;

            const json = JSON.stringify({
              profiles: btoa(
                seedUtils.encryptSeed(JSON.stringify(profiles), password)
              ),
            });

            const anchorEl = document.createElement('a');
            anchorEl.download = filename;
            anchorEl.href = URL.createObjectURL(
              new Blob([json], { type: 'application/json' })
            );
            anchorEl.click();
            onBack();
          }}
        />
      )}
    </>
  );
}
