import { usePopupSelector } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NetworkName } from 'networks/types';

import { downloadKeystore } from '../../../../keystore/utils';
import { MultiWallet } from '../../../../services/types';
import background from '../../../services/Background';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

// Define custom interface for the flattened account format
interface FlattenedAccount {
  address: string;
  name: string;
  networkCode: string;
  network: string;
  isWavesOnly: boolean;
  publicKey: string;
  type: string;
  id: string;
  seed?: string;
}

export function ExportAccounts() {
  const navigate = useNavigate();
  const [decryptedVault, setDecryptedVault] = useState<MultiWallet[] | null>(
    null,
  );
  const [accountsToExport, setAccountsToExport] = useState<
    MultiWallet[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  // Convert MultiWallet items to flattened account format for the component
  const getAccountsFromVault = (): MultiWallet[] => {
    if (!decryptedVault) return [];

    const accounts: FlattenedAccount[] = [];

    // Process each wallet in the vault
    decryptedVault.forEach(wallet => {
      // Check if this is a waves-only wallet or has multiple coin types
      const isWavesOnly = !wallet.coins?.unit0;

      // Get wallet seed if available (from authentication data)
      const seed = wallet?.seed || '';

      // Process Waves accounts - include all networks
      if (wallet.coins?.waves) {
        const publicKey = wallet.coins.waves.publicKey;
        const networks = wallet.coins.waves.networks;

        // Process mainnet if available
        if (networks?.mainnet) {
          accounts.push({
            address: networks.mainnet.address,
            name: wallet.name,
            networkCode: networks.mainnet.networkCode || 'W', // Default to 'W' if not specified
            network: 'mainnet',
            isWavesOnly,
            publicKey,
            type: wallet.type || 'seed', // Default to 'seed' if not specified
            id: wallet.id,
            seed,
          });
        }

        // Process testnet if available
        if (networks?.testnet) {
          accounts.push({
            address: networks.testnet.address,
            name: `${wallet.name} (Testnet)`,
            networkCode: networks.testnet.networkCode || 'T', // Default to 'T' if not specified
            network: 'testnet',
            isWavesOnly,
            publicKey,
            type: wallet.type || 'seed',
            id: wallet.id,
            seed,
          });
        }

        // Process stagenet if available
        if (networks?.stagenet) {
          accounts.push({
            address: networks.stagenet.address,
            name: `${wallet.name} (Stagenet)`,
            networkCode: networks.stagenet.networkCode || 'S', // Default to 'S' if not specified
            network: 'stagenet',
            isWavesOnly,
            publicKey,
            type: wallet.type || 'seed',
            id: wallet.id,
            seed,
          });
        }
      }

      // Process Unit0 accounts - include all networks
      if (wallet.coins?.unit0) {
        const publicKey = wallet.coins.unit0.publicKey;
        const networks = wallet.coins.unit0.networks;

        // Process mainnet if available
        if (networks?.mainnet) {
          accounts.push({
            address: networks.mainnet.address,
            name: wallet.name,
            networkCode: networks.mainnet.networkCode || '88811', // Default Unit0 mainnet code
            network: 'mainnet',
            isWavesOnly: false,
            publicKey,
            type: 'multichain', // Unit0 accounts are multichain
            id: wallet.id,
            seed,
          });
        }

        // Process testnet if available
        if (networks?.testnet) {
          accounts.push({
            address: networks.testnet.address,
            name: `${wallet.name} (Testnet)`,
            networkCode: networks.testnet.networkCode || '88817', // Default Unit0 testnet code
            network: 'testnet',
            isWavesOnly: false,
            publicKey,
            type: 'multichain',
            id: wallet.id,
            seed,
          });
        }
      }
    });

    return decryptedVault;
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get decrypted vault data
      const vault = await background.getDecryptedVault(password);
      console.log('vault', vault);
      setDecryptedVault(vault);
      setShowPasswordModal(false);

      setIsLoading(false);
    } catch (e) {
      console.error('Vault decryption failed:', e);
      setError(e instanceof Error ? e.message : 'Failed to decrypt vault');
      setIsLoading(false);
    }
  };

  const handleExport = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!decryptedVault || !accountsToExport) {
        throw new Error('Vault data or selected accounts are missing');
      }

      // Pass the decrypted vault as the third parameter
      await downloadKeystore(decryptedVault, undefined, password);

      navigate(-2);
    } catch (e) {
      console.error('Export failed:', e);
      setError(e instanceof Error ? e.message : 'Export failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      {showPasswordModal ? (
        <ExportPasswordModal
          showAttention
          isLoading={isLoading}
          error={error}
          onClose={() => navigate(-1)}
          onSubmit={handlePasswordSubmit}
        />
      ) : (
        <>
          <ExportKeystoreChooseItems
            items={getAccountsFromVault()}
            type="accounts"
            onSubmit={wallets => {
              // Correctly type the selected wallets
              setAccountsToExport(wallets as unknown as MultiWallet[]);
            }}
          />

          {accountsToExport != null && (
            <ExportPasswordModal
              showAttention
              isLoading={isLoading}
              error={error}
              onClose={() => {
                setAccountsToExport(null);
                setError(null);
              }}
              onSubmit={handleExport}
            />
          )}
        </>
      )}
    </>
  );
}
