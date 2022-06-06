import * as styles from './styles/settings.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button, Select } from '../ui';
import { lock, setIdle, setUiState } from '../../actions';
import { PAGES } from '../../pageConfig';
import cn from 'classnames';

interface Props extends WithTranslation {
  idle: Record<string, unknown>;
  idleOptions: { type: string; interval: unknown };
  setTab: (tab: string) => void;
  setIdle: (id: string) => void;
}

class SettingsGeneralComponent extends React.Component<Props> {
  readonly props;
  langsHandler = () => this.props.setTab(PAGES.LANGS_SETTINGS);
  passwordHandler = () => this.props.setTab(PAGES.CHANGE_PASSWORD);
  pairingHandler = () => this.props.setTab(PAGES.PAIRING);
  setIdle = id => this.props.setIdle(id);

  render() {
    const { t, idle } = this.props;

    const selectList = Object.entries<number>(idle)
      .sort(([, a], [, b]) => a - b)
      .map(([id, value]) => ({
        id,
        value,
        text: t(`settings.time_${id}`, { defaultValue: id, key: id }),
      }));

    return (
      <div className={styles.content}>
        <div className={`${styles.title1} title1`}>
          {t('settings.settingsGeneral')}
        </div>

        <div className={styles.settingsMenu}>
          <div className="margin-main-big">
            <Select
              description={t('settings.sessionTimeout')}
              fill
              selectList={selectList}
              selected={this.props.idleOptions.type}
              onSelectItem={this.setIdle}
            />
          </div>

          <div className={cn(styles.settingsMenuItem, styles.password)}>
            <Button
              id="changePassword"
              type="button"
              view="transparent"
              className={styles.settingsBtn}
              onClick={this.passwordHandler}
            >
              <div className="body1 left">{t('settings.password')}</div>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function (store) {
  return {
    autoClickProtection: store.uiState && store.uiState.autoClickProtection,
    idle: (store.config && store.config.idle) || {},
    idleOptions: store.idleOptions,
  };
};

export const SettingsGeneral = connect(mapStateToProps, {
  lock,
  setUiState,
  setIdle,
})(withTranslation()(SettingsGeneralComponent));
