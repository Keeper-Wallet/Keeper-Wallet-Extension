import { useAccountsSelector } from 'accounts/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { type NewAccountState } from 'store/reducers/localState';

import { Button, Copy, Modal } from '../ui';
import * as styles from './styles/backupSeed.styl';

export function BackUpSeed() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showCopy, setShowCopy] = useState<boolean>(false);
  const newAccount = useAccountsSelector(
    state =>
      state.localState.newAccount as Extract<NewAccountState, { type: 'seed' }>,
  );

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
        onClick={() => {
          navigate('/create-account/confirm-backup');
        }}
      >
        {t('backupSeed.continue')}
      </Button>

      <Button
        id="cancelCreation"
        onClick={() => {
          navigate('/');
        }}
      >
        {t('backupSeed.cancel')}
      </Button>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">{t('backupSeed.copied')}</div>
      </Modal>
    </div>
  );
}
