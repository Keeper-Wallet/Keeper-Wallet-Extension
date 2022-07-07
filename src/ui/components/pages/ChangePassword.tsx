import * as styles from './styles/changePassword.styl';
import { connect } from 'react-redux';
import { changePassword } from '../../actions';
import * as React from 'react';
import { Button, Error, Input, Modal } from '../ui';
import background from '../../services/Background';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CONFIG } from '../../appConfig';

const MIN_LENGTH = CONFIG.PASSWORD_MIN_LENGTH;

interface Props extends WithTranslation {
  changePassword: (p1: string, p2: string) => void;
}

class ChangePasswordComponent extends React.PureComponent<Props> {
  state = {
    firstValue: '',
    secondValue: '',
    oldValue: '',
    oldError: '',
    firstError: '',
    secondError: '',
    buttonDisabled: true,
    passwordError: false,
    showChanged: false,
    oldEqualNewError: false,
  };

  onFirstBlur = () => this._onBlur();
  onSecondBlur = () => this._onBlur();
  onOldBlur = () => this._onBlur();
  onChangeFist = e => this._onChangeFist(e);
  onChangeSecond = e => this._onChangeSecond(e);
  onChangeOld = e => this._onChangeOld(e);
  onSubmit = e => this._onSubmit(e);

  render() {
    const { t } = this.props;
    return (
      <div className={styles.newPassword}>
        <form className={styles.content} onSubmit={this.onSubmit}>
          <h2 className="title1 margin2">{t('changePassword.changeTitle')}</h2>
          <div>
            <div className="margin-main-big relative">
              <div className="basic500 tag1 input-title">
                {t('changePassword.oldPassword')}
              </div>
              <Input
                id="old"
                value={this.state.oldValue}
                type="password"
                view="password"
                autoFocus={true}
                onChange={this.onChangeOld}
                onBlur={this.onOldBlur}
                error={!!(this.state.oldError || this.state.passwordError)}
              />
              <Error
                show={!!(this.state.oldError || this.state.passwordError)}
                data-testid="oldError"
              >
                {this.state.oldError ? t('changePassword.errorShortOld') : null}
                {this.state.passwordError
                  ? t('changePassword.errorWrongOld')
                  : null}
              </Error>
            </div>

            <div className="margin-main-big relative">
              <div className="basic500 tag1 input-title">
                {t('changePassword.newPassword')}
              </div>
              <Input
                id="first"
                value={this.state.firstValue}
                type="password"
                view="password"
                onBlur={this.onFirstBlur}
                onChange={this.onChangeFist}
                error={!!this.state.firstError || this.state.oldEqualNewError}
              />
              <Error show={!!this.state.firstError} data-testid="firstError">
                {t('changePassword.errorShortNew')}
              </Error>
            </div>

            <div className="margin-main-big relative">
              <div className="basic500 tag1 input-title">
                {t('changePassword.confirmPassword')}
              </div>
              <Input
                id="second"
                value={this.state.secondValue}
                type="password"
                view="password"
                onBlur={this.onSecondBlur}
                onChange={this.onChangeSecond}
                error={!!this.state.secondError || this.state.oldEqualNewError}
              />
              <Error
                show={!!this.state.secondError || this.state.oldEqualNewError}
                data-testid="secondError"
              >
                {this.state.oldEqualNewError
                  ? t('changePassword.equalPassword')
                  : null}
                {this.state.secondError
                  ? t('changePassword.errorWrongConfirm')
                  : null}
              </Error>
            </div>
          </div>
          <Button
            type="submit"
            view="submit"
            disabled={this.state.buttonDisabled}
          >
            {t('changePassword.create')}
          </Button>
        </form>
        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showChanged}
        >
          <div className="modal notification">{t('changePassword.done')}</div>
        </Modal>
      </div>
    );
  }

  _onSubmit(e) {
    e.preventDefault();

    if (this.state.firstValue) {
      background.newPassword(this.state.oldValue, this.state.firstValue).then(
        () => {
          this.setState({
            firstValue: '',
            secondValue: '',
            oldValue: '',
            oldError: null,
            firstError: null,
            secondError: null,
            buttonDisabled: true,
            passwordError: false,
            showChanged: true,
            oldEqualNewError: false,
          });

          setTimeout(() => this.setState({ showChanged: false }), 1000);
        },
        () => this.setState({ passwordError: true })
      );
    }
  }

  _onBlur() {
    this._checkValues();
  }

  _onChange(oldValue, firstValue, secondValue) {
    const buttonDisabled = this._isDisabledButton(
      oldValue,
      firstValue,
      secondValue
    );
    this.setState({ oldValue, firstValue, secondValue, buttonDisabled });
  }

  _onChangeFist(e) {
    const firstValue = e.target.value;
    const { oldValue, secondValue } = this.state;
    this._onChange(oldValue, firstValue, secondValue);
  }

  _onChangeSecond(e) {
    const secondValue = e.target.value;
    const { oldValue, firstValue } = this.state;
    this._onChange(oldValue, firstValue, secondValue);
  }

  _onChangeOld(e) {
    const oldValue = e.target.value;
    const { secondValue, firstValue } = this.state;
    this._onChange(oldValue, firstValue, secondValue);
  }

  _isDisabledButton(oldValue, firstValue, secondValue) {
    if (!oldValue || !firstValue || !secondValue) {
      return true;
    }

    if (oldValue.length < MIN_LENGTH) {
      return true;
    }

    return (
      firstValue !== secondValue ||
      secondValue.length < MIN_LENGTH ||
      firstValue === oldValue
    );
  }

  _checkValues() {
    let { passwordError, firstValue, oldValue } = this.state;
    const oldError = this._validateOld();
    const firstError = this._validateFirst();
    const secondError = this._validateSecond();
    const oldEqualNewError =
      !firstError &&
      !secondError &&
      !oldError &&
      oldValue &&
      firstValue === oldValue;
    const buttonDisabled =
      oldEqualNewError ||
      oldError ||
      firstError ||
      secondError ||
      !oldValue ||
      !firstValue;

    if (oldError) {
      passwordError = false;
    }

    this.setState({
      oldEqualNewError,
      oldError,
      firstError,
      passwordError,
      secondError,
      buttonDisabled,
    });
  }

  _validateOld() {
    if (!this.state.oldValue) {
      return null;
    }

    if (this.state.oldValue.length < MIN_LENGTH) {
      return { error: 'isSmall' };
    }
  }

  _validateFirst() {
    if (!this.state.firstValue) {
      return null;
    }

    if (this.state.firstValue.length < MIN_LENGTH) {
      return { error: 'isSmall' };
    }
  }

  _validateSecond() {
    if (!this.state.secondValue || !this.state.firstValue) {
      return null;
    }

    if (this.state.firstValue === this.state.secondValue) {
      return null;
    }

    return { error: 'noMatch' };
  }
}

export const ChangePassword = connect(undefined, { changePassword })(
  withTranslation()(ChangePasswordComponent)
);
