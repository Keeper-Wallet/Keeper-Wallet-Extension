import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import * as styles from './styles/import.styl';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, Modal } from '../ui';
import * as wavesKeeperLock from '../../assets/img/waves-keeper-lock.svg';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { connect } from 'react-redux';
import { setUiState } from '../../actions';
import { AnyAction } from 'redux';
import { PAGES } from '../../pageConfig';

interface Props {
  showUpdateInfo: boolean;
  setTab: (newTab: string) => void;
  dispatch: (action: AnyAction) => void;
}

export const Import = connect((state: any) => ({
  showUpdateInfo:
    !state.uiState.isFeatureUpdateShown && !!state.allNetworksAccounts.length,
}))(function Import({ showUpdateInfo, setTab, dispatch }: Props) {
  const dismissFeatureInfo = () =>
    dispatch(setUiState({ isFeatureUpdateShown: true }));
  const exportToKeystore = () => setTab(PAGES.EXPORT_ACCOUNTS);

  return (
    <div className={styles.root}>
      <img
        className={styles.importIcon}
        src={wavesKeeperLock}
        alt=""
        width={220}
        height={200}
      />

      <Button
        id="createNewAccount"
        type="submit"
        onClick={() => setTab('new_account')}
      >
        <Trans i18nKey="import.createNew" />
      </Button>

      <div className={cn('body1', 'disabled500', 'font300', styles.separator)}>
        <Trans i18nKey="import.importVia">Or import via</Trans>
      </div>

      <div>
        <div className={styles.importButtonsItem}>
          <Button
            className="fullwidth"
            data-testid="importSeed"
            type="transparent"
            onClick={() => setTab('import_seed')}
          >
            <div className="body1">
              <Trans i18nKey="import.viaSeed" />
            </div>
          </Button>
        </div>

        {TransportWebUSB.isSupported && (
          <div className={styles.importButtonsItem}>
            <Button
              className="fullwidth"
              type="transparent"
              onClick={() => setTab(PAGES.IMPORT_LEDGER)}
            >
              <div className="body1">
                <Trans i18nKey="import.viaLedger" />
              </div>
            </Button>
          </div>
        )}

        <div className={styles.importButtonsItem}>
          <Button
            className="fullwidth"
            data-testid="importKeystore"
            type="transparent"
            onClick={() => setTab('import_keystore')}
          >
            <div className="body1">
              <Trans i18nKey="import.viaKeystore" />
            </div>
          </Button>
        </div>
      </div>

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showUpdateInfo}>
        <FeatureUpdateInfo
          onClose={dismissFeatureInfo}
          onSubmit={() => {
            dismissFeatureInfo();
            exportToKeystore();
          }}
        />
      </Modal>
    </div>
  );
});
