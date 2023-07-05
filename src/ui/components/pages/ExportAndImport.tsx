import { usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import background from 'ui/services/Background';

import { downloadKeystore } from '../../../keystore/utils';
import { isExportable } from '../pages/exportAccounts/chooseItems';
import { ExportPasswordModal } from '../pages/exportAccounts/passwordModal';
import { Button } from '../ui';
import * as styles from './ExportAndImport.module.css';

export function ExportAndImport() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const addresses = usePopupSelector(state => state.addresses);
  const allNetworksAccounts = usePopupSelector(
    state => state.allNetworksAccounts,
  );

  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className={styles.content}>
      <h2 className={`${styles.title} title1`}>
        {t('settings.exportAndImport')}
      </h2>

      <Button
        className={styles.exportBtn}
        data-testid="exportAccounts"
        type="button"
        view="transparent"
        onClick={() => {
          navigate('/export-accounts');
        }}
      >
        <p className="body1 left">{t('exportAndImport.exportAccounts')}</p>
      </Button>
      <Button
        className={styles.importBtn}
        type="button"
        view="transparent"
        onClick={() => {
          background.showTab(
            `${window.location.origin}/accounts.html#/import-keystore`,
            'import-keystore',
          );
          navigate('/', { replace: true });
        }}
      >
        <p className="body1 left">{t('exportAndImport.importAccounts')}</p>
      </Button>

      <Button
        className={styles.exportBtn}
        type="button"
        view="transparent"
        onClick={() => {
          navigate('/export-address-book');
        }}
      >
        <p className="body1 left">{t('exportAndImport.exportAddressBook')}</p>
      </Button>
      <Button
        className={styles.importBtn}
        type="button"
        view="transparent"
        onClick={() => {
          background.showTab(
            `${window.location.origin}/accounts.html#/import-address-book`,
            'import-address-book',
          );
          navigate('/', { replace: true });
        }}
      >
        <p className="body1 left">{t('exportAndImport.importAddressBook')}</p>
      </Button>

      <div className={styles.footer}>
        <div
          className={styles.exportAll}
          onClick={() => {
            setShowExportModal(true);
          }}
        >
          <i className={styles.exportAllIcon} />
          <span>{t('exportAndImport.exportAll')}</span>
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
                allNetworksAccounts.filter(isExportable),
                addresses,
                password,
                encrypted,
              );
              navigate('/settings', { replace: true });
            }}
          />
        )}
      </div>
    </div>
  );
}
