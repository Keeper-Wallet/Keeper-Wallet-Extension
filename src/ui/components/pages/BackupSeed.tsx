import * as styles from './styles/backupSeed.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, Copy, Modal } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAppDispatch, useAppSelector } from 'accounts/store';

export function BackUpSeed({ setTab }) {
  const dispatch = useAppDispatch();
  const [showCopy, setShowCopy] = React.useState<boolean>(false);
  const newAccount = useAppSelector(state => state.localState.newAccount);

  return (
    <div className={styles.content}>
      <h2 className="title1 margin2">
        <Trans i18nKey="backupSeed.saveBackup">Save backup phrase</Trans>
      </h2>

      <div className="flex margin-main">
        <div className="basic500 tag1">
          <Trans i18nKey="backupSeed.backupCarefully">
            Please carefully write down these 15 words or copy them
          </Trans>
        </div>
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
        <Trans i18nKey="backupSeed.confirmBackupInfo">
          You will confirm this phrase on the next screen
        </Trans>
      </div>

      <Button
        id="continue"
        className="margin-main-big"
        type="submit"
        onClick={() => dispatch(setTab(PAGES.CONFIRM_BACKUP))}
      >
        <Trans i18nKey="backupSeed.continue">Continue</Trans>
      </Button>

      <Button id="cancelCreation" onClick={() => dispatch(setTab(PAGES.ROOT))}>
        <Trans i18nKey="backupSeed.cancel">Cancel creation</Trans>
      </Button>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">
          <Trans i18nKey="backupSeed.copied">Copied!</Trans>
        </div>
      </Modal>
    </div>
  );
}
