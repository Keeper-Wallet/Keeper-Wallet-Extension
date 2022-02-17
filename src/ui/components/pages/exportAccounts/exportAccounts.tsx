import * as React from 'react';
import { connect } from 'react-redux';
import background from '../../../services/Background';
import {
  ExportKeystoreChooseAccounts,
  ExportKeystoreAccount,
} from './chooseAccounts';
import { ExportAccountsPasswordModal } from './passwordModal';
import { seedUtils } from '@waves/waves-transactions';

interface Props {
  allNetworksAccounts: ExportKeystoreAccount[];
  onBack: () => void;
}

const mapStateToProps = (store: any) => ({
  allNetworksAccounts: store.allNetworksAccounts,
});

export const ExportAccounts = connect(mapStateToProps)(function ExportAccounts({
  allNetworksAccounts,
  onBack,
}: Props) {
  const [accountsToExport, setAccountsToExport] = React.useState<
    ExportKeystoreAccount[] | null
  >(null);

  return (
    <>
      <ExportKeystoreChooseAccounts
        accounts={allNetworksAccounts}
        onSubmit={selectedAccounts => {
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
              accountsToExport.map(async acc => ({
                address: acc.address,
                name: acc.name,
                network: acc.network,
                networkCode: acc.networkCode,
                seed: await background.getAccountSeed(
                  acc.address,
                  acc.network,
                  password
                ),
              }))
            );

            const profiles = accounts.reduce<
              Record<
                'mainnet' | 'testnet' | 'stagenet' | 'custom',
                {
                  accounts: Array<{
                    address: string;
                    name: string;
                    networkCode: string;
                    seed: string;
                  }>;
                }
              >
            >(
              (result, acc) => {
                result[acc.network].accounts.push({
                  address: acc.address,
                  name: acc.name,
                  networkCode: acc.networkCode,
                  seed: acc.seed,
                });

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
});
