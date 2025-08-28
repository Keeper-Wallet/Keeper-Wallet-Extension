import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadKeystore } from '../../../../keystore/utils';
import { MultiWallet } from '../../../../services/types';
import background from '../../../services/Background';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAccounts() {
  const navigate = useNavigate();
  const [decryptedVault, setDecryptedVault] = useState<MultiWallet[] | null>(
    null,
  );
  const [accountsToExport, setAccountsToExport] = useState<
    MultiWallet[] | null
  >(null);
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  // Convert MultiWallet items to flattened account format for the component
  const getAccountsFromVault = (): MultiWallet[] => {
    if (!decryptedVault) return [];
    return decryptedVault;
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      // Get decrypted vault data
      const vault = await background.getDecryptedVault(password);
      setDecryptedVault(vault);
      setShowPasswordModal(false);
    } catch (e) {
      console.error('Vault decryption failed:', e);
    }
  };

  const handleExport = async (password: string) => {
    try {
      if (!decryptedVault || !accountsToExport) {
        throw new Error('Vault data or selected accounts are missing');
      }

      // Pass the decrypted vault as the third parameter
      await downloadKeystore(accountsToExport, undefined, password);

      navigate(-2);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <>
      {showPasswordModal ? (
        <ExportPasswordModal
          showAttention
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
              onClose={() => {
                setAccountsToExport(null);
              }}
              onSubmit={handleExport}
            />
          )}
        </>
      )}
    </>
  );
}
