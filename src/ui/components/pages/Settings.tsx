import * as styles from './styles/settings.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, PowerButton } from '../ui';
import { lock, setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import { Tooltip } from '../ui/tooltip';

class SettingsComponent extends React.Component {
  readonly props;
  lock = () => {
    this.props.setTab(null);
    this.props.lock();
  };
  networkHandler = () => this.props.setTab(PAGES.NETWORK_SETTINGS);
  exportHandler = () => this.props.setTab(PAGES.EXPORT_ACCOUNTS);
  langsHandler = () => this.props.setTab(PAGES.LANGS_SETTINGS);
  permissionsHandler = () => this.props.setTab(PAGES.PERMISSIONS);
  passwordHandler = () => this.props.setTab(PAGES.CHANGE_PASSWORD);
  deleteHandler = () => this.props.setTab(PAGES.DELETE_ACCOUNT);
  pairingHandler = () => this.props.setTab(PAGES.PAIRING);
  settingsGeneral = () => this.props.setTab(PAGES.GENERAL_SETTINGS);
  toggleAutoLockHandler = () => {
    this.props.setUiState({
      autoClickProtection: !this.props.autoClickProtection,
    });
  };

  render() {
    const { t } = this.props;
    return (
      <div className={styles.content}>
        <div className={`${styles.title1} title1`}>
          {t('settings.settings')}
        </div>
        <div className={styles.settingsMenu}>
          <div className={`${styles.settingsMenuItem} ${styles.general}`}>
            <Button
              id="settingsGeneral"
              type="button"
              view="transparent"
              className={styles.settingsBtn}
              onClick={this.settingsGeneral}
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
              onClick={this.permissionsHandler}
            >
              <div className="body1 left">
                {t('settings.permissionsControl')}
              </div>
            </Button>
          </div>

          <div className={`${styles.settingsMenuItem} ${styles.language}`}>
            <Button
              id="settingsLangs"
              type="button"
              view="transparent"
              className={styles.settingsBtn}
              onClick={this.langsHandler}
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
              onClick={this.networkHandler}
            >
              <div className="body1 left">{t('settings.network')}</div>
            </Button>
          </div>

          <div className={`${styles.settingsMenuItem} ${styles.export}`}>
            <Button
              data-testid="exportMenuItem"
              id="settingsExport"
              type="button"
              view="transparent"
              className={styles.settingsBtn}
              onClick={this.exportHandler}
            >
              <div className="body1 left">{t('settings.export')}</div>
            </Button>
          </div>
        </div>

        <div className={styles.quickSettingsMenu}>
          <div
            className={`${styles.clickProtection} tag1`}
            data-testid="clickProtection"
          >
            <PowerButton
              onClick={this.toggleAutoLockHandler}
              enabled={this.props.autoClickProtection}
              data-testid="clickProtectionBtn"
              data-teston={this.props.autoClickProtection}
            />
            <div className={`${styles.powerBtnState} left`}>
              <div>{t('settings.autoClick')}</div>
              <div data-testid="clickProtectionStatus">
                {!this.props.autoClickProtection ? (
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

          <div className={`${styles.showSuspiciousAssets} tag1`}>
            <PowerButton
              onClick={() =>
                this.props.setUiState({
                  showSuspiciousAssets: !this.props.showSuspiciousAssets,
                })
              }
              enabled={!this.props.showSuspiciousAssets}
              data-testid="showSuspiciousAssetsBtn"
              data-teston={!this.props.showSuspiciousAssets}
            />
            <div className={`${styles.powerBtnState} left`}>
              <div>{t('settings.suspiciousAssetsProtection')}</div>
              <div data-testid="showSuspiciousAssetsStatus">
                {this.props.showSuspiciousAssets ? (
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
                onClick={this.deleteHandler}
              >
                <i className={styles.icon}> </i>
                <span>{t('settings.deleteAccounts')}</span>
              </div>
            </div>
            <div>
              <div className={styles.logout} onClick={this.lock}>
                <i className={styles.icon}> </i>
                <span>{t('settings.logOut')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function (store) {
  return {
    autoClickProtection: store.uiState && store.uiState.autoClickProtection,
    showSuspiciousAssets: store.uiState?.showSuspiciousAssets ?? false,
  };
};

export const Settings = connect(mapStateToProps, { lock, setUiState })(
  withTranslation()(SettingsComponent)
);
