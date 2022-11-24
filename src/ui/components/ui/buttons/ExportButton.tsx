import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'ui/store';

import { downloadKeystore } from '../../../../keystore/utils';
import { isExportable } from '../../pages/exportAccounts/chooseItems';
import { ExportPasswordModal } from '../../pages/exportAccounts/passwordModal';
import * as styles from './ExportButton.module.css';

interface Props {
  className?: string;
}

export const ExportButton = ({ className }: Props) => {
  const { t } = useTranslation();

  const addresses = useAppSelector(state => state.addresses);
  const accounts = useAppSelector(state => state.allNetworksAccounts);

  const [showExportModal, setShowExportModal] = useState(false);

  return accounts.length !== 0 || Object.keys(addresses).length !== 0 ? (
    <>
      <div
        className={`${styles.exportWrapper} ${className}`}
        onClick={() => {
          setShowExportModal(true);
        }}
      >
        <span>{t('errorPage.export')}</span>
        <i className={styles.exportIcon} />
      </div>

      {showExportModal && (
        <ExportPasswordModal
          showAttention
          showEncrypted
          onClose={() => {
            setShowExportModal(false);
          }}
          onSubmit={async (password, encrypted) => {
            await downloadKeystore(
              accounts.filter(isExportable),
              addresses,
              password,
              encrypted
            );
            setShowExportModal(false);
          }}
        />
      )}
    </>
  ) : null;
};
