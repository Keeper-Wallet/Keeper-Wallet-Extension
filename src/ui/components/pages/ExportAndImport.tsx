import * as styles from './ExportAndImport.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'ui/store';
import background from 'ui/services/Background';
import { useNavigate } from '../../router';
import { PAGES } from '../../pageConfig';
import { Button } from '../ui';
import { downloadKeystore } from '../../../keystore/utils';
import { ExportPasswordModal } from '../pages/exportAccounts/passwordModal';
import { isExportable } from '../pages/exportAccounts/chooseItems';

export function ExportAndImport() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const addresses = useAppSelector(state => state.addresses);
  const allNetworksAccounts = useAppSelector(
    state => state.allNetworksAccounts
  );

  const [showExportModal, setShowExportModal] = React.useState(false);

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
          navigate(PAGES.EXPORT_ACCOUNTS);
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
            `${window.location.origin}/accounts.html#${PAGES.IMPORT_KEYSTORE}`,
            PAGES.IMPORT_KEYSTORE
          );
          navigate(PAGES.ASSETS, { replace: true });
        }}
      >
        <p className="body1 left">{t('exportAndImport.importAccounts')}</p>
      </Button>

      <Button
        className={styles.exportBtn}
        type="button"
        view="transparent"
        onClick={() => {
          navigate(PAGES.EXPORT_ADDRESS_BOOK);
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
            `${window.location.origin}/accounts.html#${PAGES.IMPORT_ADDRESS_BOOK}`,
            PAGES.IMPORT_ADDRESS_BOOK
          );
          navigate(PAGES.ASSETS, { replace: true });
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
                encrypted
              );
              navigate(PAGES.SETTINGS, { replace: true });
            }}
          />
        )}
      </div>
    </div>
  );
}
