import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Background from 'ui/services/Background';

import { setUiState } from '../../../store/actions/uiState';
import { Button, PowerButton } from '../ui';
import { Tooltip } from '../ui/tooltip';
import * as styles from './styles/settings.styl';

export function Settings() {
  const navigate = useNavigate();
  const dispatch = usePopupDispatch();
  const { t } = useTranslation();

  const autoClickProtection = usePopupSelector(
    state => state.uiState.autoClickProtection,
  );

  const showSuspiciousAssets = usePopupSelector(
    state => state.uiState.showSuspiciousAssets,
  );

  return (
    <div className={styles.content}>
      <div className={`${styles.title1} title1`}>{t('settings.settings')}</div>
      <div className={styles.settingsMenu}>
        <div className={`${styles.settingsMenuItem} ${styles.addresses}`}>
          <Button
            id="settingsAddresses"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/address-book');
            }}
          >
            <div className="body1 left">{t('address.title')}</div>
          </Button>
        </div>

        <div className={`${styles.settingsMenuItem} ${styles.general}`}>
          <Button
            id="settingsGeneral"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/settings/general');
            }}
          >
            <div className="body1 left">{t('settings.settingsGeneral')}</div>
          </Button>
        </div>

        <div className={`${styles.settingsMenuItem} ${styles.permissions}`}>
          <Button
            id="settingsPermission"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/settings/permissions');
            }}
          >
            <div className="body1 left">{t('settings.permissionsControl')}</div>
          </Button>
        </div>

        <div className={`${styles.settingsMenuItem} ${styles.language}`}>
          <Button
            id="settingsLangs"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/settings/language');
            }}
          >
            <div className="body1 left">{t('settings.langs')}</div>
          </Button>
        </div>

        <div className={`${styles.settingsMenuItem} ${styles.network}`}>
          <Button
            id="settingsNetwork"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/settings/network');
            }}
          >
            <div className="body1 left">{t('settings.network')}</div>
          </Button>
        </div>

        <div className={`${styles.settingsMenuItem} ${styles.exportButton}`}>
          <Button
            data-testid="exportMenuItem"
            id="settingsExport"
            type="button"
            view="transparent"
            className={styles.settingsBtn}
            onClick={() => {
              navigate('/settings/export-and-import');
            }}
          >
            <div className="body1 left">{t('settings.exportAndImport')}</div>
          </Button>
        </div>
      </div>

      <div className={styles.quickSettingsMenu}>
        <div
          className={`${styles.clickProtection} tag1`}
          data-testid="clickProtection"
        >
          <PowerButton
            onClick={() => {
              dispatch(
                setUiState({
                  autoClickProtection: !autoClickProtection,
                }),
              );
            }}
            enabled={autoClickProtection}
            data-testid="clickProtectionBtn"
            data-teston={autoClickProtection}
          />
          <div className={`${styles.powerBtnState} left`}>
            <div>{t('settings.autoClick')}</div>
            <div data-testid="clickProtectionStatus">
              {!autoClickProtection ? (
                <span className="basic500">
                  {t('settings.autoClickDisable')}
                </span>
              ) : (
                <span className="submit400">
                  {t('settings.autoClickEnable')}
                </span>
              )}
            </div>
          </div>
          <Tooltip
            content={t('settings.tooltipContent')}
            className={styles.helpTooltip}
            data-testid="clickProtectionTooltip"
          >
            {props => (
              <i
                className="helpIcon"
                data-testid="clickProtectionIcon"
                {...props}
              />
            )}
          </Tooltip>
        </div>

        <div
          className={`${styles.showSuspiciousAssets} tag1`}
          data-testid="showSuspiciousAssets"
        >
          <PowerButton
            onClick={() =>
              dispatch(
                setUiState({
                  showSuspiciousAssets: !showSuspiciousAssets,
                }),
              )
            }
            enabled={!showSuspiciousAssets}
            data-testid="showSuspiciousAssetsBtn"
            data-teston={!showSuspiciousAssets}
          />
          <div className={`${styles.powerBtnState} left`}>
            <div>{t('settings.suspiciousAssetsProtection')}</div>
            <div data-testid="showSuspiciousAssetsStatus">
              {showSuspiciousAssets ? (
                <span className="basic500">
                  {t('settings.autoClickDisable')}
                </span>
              ) : (
                <span className="submit400">
                  {t('settings.autoClickEnable')}
                </span>
              )}
            </div>
          </div>
          <Tooltip
            content={t('settings.suspiciousAssetsTooltip')}
            className={styles.helpTooltip}
            data-testid="showSuspiciousAssetsTooltip"
          >
            {props => (
              <i
                className="helpIcon"
                data-testid="showSuspiciousAssetsIcon"
                {...props}
              />
            )}
          </Tooltip>
        </div>
      </div>

      <div className={`${styles.settingsFooter} tag1`}>
        <div className={styles.buttonsWrapper}>
          <div>
            <div
              className={styles.deleteAccounts}
              onClick={() => {
                navigate('/delete-all-accounts');
              }}
            >
              <i className={styles.icon}> </i>
              <span>{t('settings.deleteAccounts')}</span>
            </div>
          </div>
          <div>
            <div
              className={styles.logout}
              onClick={() => {
                navigate('/');
                Background.lock();
              }}
            >
              <i className={styles.icon}> </i>
              <span>{t('settings.logOut')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
