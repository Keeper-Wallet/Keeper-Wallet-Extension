import * as styles from './styles/settings.styl';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, PowerButton } from '../ui';
import { lock, navigate, setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import { Tooltip } from '../ui/tooltip';
import { useAppDispatch, useAppSelector } from 'ui/store';

export function Settings() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const autoClickProtection = useAppSelector(
    state => state.uiState.autoClickProtection
  );

  const showSuspiciousAssets = useAppSelector(
    state => state.uiState.showSuspiciousAssets
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
              dispatch(navigate(PAGES.ADDRESS_BOOK));
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
              dispatch(navigate(PAGES.GENERAL_SETTINGS));
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
              dispatch(navigate(PAGES.PERMISSIONS));
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
              dispatch(navigate(PAGES.LANGS_SETTINGS));
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
              dispatch(navigate(PAGES.NETWORK_SETTINGS));
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
              dispatch(navigate(PAGES.EXPORT_AND_IMPORT));
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
                })
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
                })
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
                dispatch(navigate(PAGES.DELETE_ACCOUNT));
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
                dispatch(navigate(null));
                dispatch(lock());
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
