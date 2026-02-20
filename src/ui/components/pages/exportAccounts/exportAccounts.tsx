import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { downloadKeystore } from '../../../../keystore/utils';
import { type MultiWallet } from '../../../../services/types';
import background from '../../../services/Background';
import { ExportKeystoreChooseItems } from './chooseItems';
import { ExportPasswordModal } from './passwordModal';

export function ExportAccounts() {
  const { t } = useTranslation();
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
    // Get decrypted vault data
    const vault = await background.getDecryptedVault(password);
    setDecryptedVault(vault);
    setShowPasswordModal(false);
  };

  const handleExport = async (password: string) => {
    if (!decryptedVault || !accountsToExport) {
      throw new Error(t('exportKeystore.vaultDataMissing'));
    }
    // Pass the decrypted vault as the third parameter
    await downloadKeystore(accountsToExport, undefined, password);

    navigate(-2);
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
