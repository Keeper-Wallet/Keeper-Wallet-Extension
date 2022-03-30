import * as styles from './styles/langsSettings.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { Button } from '../ui';
import { setLocale, setUiState } from '../../actions';
import cn from 'classnames';

const Lang = ({ id, name, onSelect, selected }) => {
  const className = cn(styles[id], styles.lang, {
    [styles.selected]: selected,
  });
  const iconClass = cn(styles.flagIcon, {
    'selected-lang': selected,
    [`flag-${id}-icon`]: !selected,
  });

  return (
    <div className={className}>
      <div
        className={`${styles.selectButton} fullwidth body1 left`}
        onClick={onSelect}
      >
        <Trans i18nKey={`langsSettings.${id}`}>{name}</Trans>
      </div>
      <div className={iconClass}></div>
    </div>
  );
};

class LangsSettingsComponent extends React.PureComponent {
  readonly props;
  confirmHandler = () => {
    this.props.setUiState({ selectedLangs: true });
  };

  render() {
    const className = cn(styles.content, {
      introLangList: !this.props.selectedLangs,
    });

    return (
      <div className={className}>
        {this.props.hideTitle ? null : (
          <h2 className="title1 margin-main-big">
            <Trans i18nKey="langsSettings.title">Change the language</Trans>
          </h2>
        )}
        <div className={styles.langsList}>
          {this.props.langs.map(({ id, name }) => {
            return (
              <Lang
                id={id}
                key={id}
                name={name}
                onSelect={() => this.onSelect(id)}
                selected={id === this.props.currentLocale}
              />
            );
          })}
        </div>
        {!this.props.selectedLangs ? (
          <Button
            className={styles.langsConfirm}
            onClick={this.confirmHandler}
            type="submit"
            view="submit"
          >
            <Trans i18nKey="langsSettings.confirm">Confirm</Trans>
          </Button>
        ) : null}
      </div>
    );
  }

  onSelect(lang) {
    this.props.setLocale(lang);
  }
}

const mapStateToProps = function (store) {
  return {
    currentLocale: store.currentLocale,
    langs: store.langs,
    selectedLangs: store.uiState.selectedLangs,
  };
};

const actions = {
  setUiState,
  setLocale,
};

export const LangsSettings = connect(
  mapStateToProps,
  actions
)(LangsSettingsComponent);
