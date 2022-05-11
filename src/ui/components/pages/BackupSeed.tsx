import * as styles from './styles/backupSeed.styl';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Copy, Modal } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAccountsSelector } from 'accounts/store';

export function BackUpSeed({ setTab }) {
  const { t } = useTranslation();
  const [showCopy, setShowCopy] = React.useState<boolean>(false);
  const newAccount = useAccountsSelector(state => state.localState.newAccount);

  return (
    <div className={styles.content}>
      <h2 className="title1 margin2">{t('backupSeed.saveBackup')}</h2>

      <div className="flex margin-main">
        <div className="basic500 tag1">{t('backupSeed.backupCarefully')}</div>
        <Copy
          text={newAccount.seed}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
        >
          <i className={`copy-icon ${styles.copyIcon}`}> </i>
        </Copy>
      </div>

      <div className={`plate center body3 cant-select ${styles.plateMargin}`}>
        {newAccount.seed}
      </div>

      <div className={`basic500 tag1 margin1 center ${styles.bottomText}`}>
        {t('backupSeed.confirmBackupInfo')}
      </div>

      <Button
        id="continue"
        className="margin-main-big"
        type="submit"
        onClick={() => setTab(PAGES.CONFIRM_BACKUP)}
      >
        {t('backupSeed.continue')}
      </Button>

      <Button id="cancelCreation" onClick={() => setTab(PAGES.ROOT)}>
        {t('backupSeed.cancel')}
      </Button>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">{t('backupSeed.copied')}</div>
      </Modal>
    </div>
  );
}
