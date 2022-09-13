import * as styles from './styles/settings.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button, Select } from '../ui';
import { lock, setIdle, setUiState } from '../../actions';
import { PageComponentProps, PAGES } from '../../pageConfig';
import cn from 'classnames';
import { AppState } from 'ui/store';

interface StateProps {
  autoClickProtection: boolean | undefined;
  idle: Record<string, number>;
  idleOptions: { type?: string; interval?: unknown };
}

interface DispatchProps {
  setIdle: (id: string) => void;
}

type Props = PageComponentProps & WithTranslation & DispatchProps & StateProps;

class SettingsGeneralComponent extends React.Component<Props> {
  langsHandler = () => this.props.pushTab(PAGES.LANGS_SETTINGS);
  passwordHandler = () => this.props.pushTab(PAGES.CHANGE_PASSWORD);
  setIdle = (id: string | number) => this.props.setIdle(id as string);

  render() {
    const { t, idle } = this.props;

    const selectList = Object.entries(idle)
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

const mapStateToProps = function (store: AppState): StateProps {
  return {
    autoClickProtection: store.uiState && store.uiState.autoClickProtection,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    idle: (store.config && (store.config as any).idle) || {},
    idleOptions: store.idleOptions,
  };
};

export const SettingsGeneral = connect(mapStateToProps, {
  lock,
  setUiState,
  setIdle,
})(withTranslation()(SettingsGeneralComponent));
