import * as styles from './ExportAndImport.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from 'ui/store';
import background from 'ui/services/Background';
import { addBackTab, setTab } from '../../actions';
import { PAGES } from '../../pageConfig';
import { Button } from '../ui';
import { downloadKeystore } from '../../utils/keystore';
import { ExportPasswordModal } from '../pages/exportAccounts/passwordModal';

export function ExportAndImport() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

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
          dispatch(addBackTab(PAGES.EXPORT_AND_IMPORT));
          dispatch(setTab(PAGES.EXPORT_ACCOUNTS));
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
          dispatch(setTab(PAGES.ROOT));
        }}
      >
        <p className="body1 left">{t('exportAndImport.importAccounts')}</p>
      </Button>

      <Button
        className={styles.exportBtn}
        type="button"
        view="transparent"
        onClick={() => {
          dispatch(addBackTab(PAGES.EXPORT_AND_IMPORT));
          dispatch(setTab(PAGES.EXPORT_ADDRESS_BOOK));
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
          dispatch(setTab(PAGES.ROOT));
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
            onClose={() => {
              setShowExportModal(false);
            }}
            onSubmit={async password => {
              await downloadKeystore(allNetworksAccounts, addresses, password);
              dispatch(setTab(PAGES.SETTINGS));
            }}
          />
        )}
      </div>
    </div>
  );
}
