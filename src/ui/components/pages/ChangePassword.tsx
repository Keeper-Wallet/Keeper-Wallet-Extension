import { PureComponent } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';

import { CONFIG } from '../../appConfig';
import background from '../../services/Background';
import { Button, ErrorMessage, Input, Modal } from '../ui';
import * as styles from './styles/changePassword.styl';

const MIN_LENGTH = CONFIG.PASSWORD_MIN_LENGTH;

type Props = WithTranslation;

interface State {
  firstValue: string;
  secondValue: string;
  oldValue: string;
  oldError: string | { error: string } | null | undefined;
  firstError: string | { error: string } | null | undefined;
  secondError: string | { error: string } | null;
  buttonDisabled: boolean | { error: string };
  passwordError: boolean;
  showChanged: boolean;
  oldEqualNewError: boolean | '';
}

class ChangePasswordComponent extends PureComponent<Props, State> {
  state: State = {
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
  onChangeFist = (e: React.ChangeEvent<HTMLInputElement>) =>
    this._onChangeFist(e);
  onChangeSecond = (e: React.ChangeEvent<HTMLInputElement>) =>
    this._onChangeSecond(e);
  onChangeOld = (e: React.ChangeEvent<HTMLInputElement>) =>
    this._onChangeOld(e);
  onSubmit = (e: React.FormEvent<HTMLFormElement>) => this._onSubmit(e);

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
                autoComplete="current-password"
                autoFocus
                error={!!(this.state.oldError || this.state.passwordError)}
                id="old"
                type="password"
                value={this.state.oldValue}
                view="password"
                onBlur={this.onOldBlur}
                onChange={this.onChangeOld}
              />
              <ErrorMessage
                show={!!(this.state.oldError || this.state.passwordError)}
                data-testid="oldError"
              >
                {this.state.oldError ? t('changePassword.errorShortOld') : null}
                {this.state.passwordError
                  ? t('changePassword.errorWrongOld')
                  : null}
              </ErrorMessage>
            </div>

            <div className="margin-main-big relative">
              <div className="basic500 tag1 input-title">
                {t('changePassword.newPassword')}
              </div>
              <Input
                autoComplete="new-password"
                error={!!this.state.firstError || this.state.oldEqualNewError}
                id="first"
                type="password"
                value={this.state.firstValue}
                view="password"
                onBlur={this.onFirstBlur}
                onChange={this.onChangeFist}
              />
              <ErrorMessage
                show={!!this.state.firstError}
                data-testid="firstError"
              >
                {t('changePassword.errorShortNew')}
              </ErrorMessage>
            </div>

            <div className="margin-main-big relative">
              <div className="basic500 tag1 input-title">
                {t('changePassword.confirmPassword')}
              </div>
              <Input
                autoComplete="new-password"
                error={!!this.state.secondError || this.state.oldEqualNewError}
                id="second"
                type="password"
                value={this.state.secondValue}
                view="password"
                onBlur={this.onSecondBlur}
                onChange={this.onChangeSecond}
              />
              <ErrorMessage
                show={!!this.state.secondError || this.state.oldEqualNewError}
                data-testid="secondError"
              >
                {this.state.oldEqualNewError
                  ? t('changePassword.equalPassword')
                  : null}
                {this.state.secondError
                  ? t('changePassword.errorWrongConfirm')
                  : null}
              </ErrorMessage>
            </div>
          </div>
          <Button
            type="submit"
            view="submit"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            disabled={this.state.buttonDisabled as any}
          >
            {t('changePassword.create')}
          </Button>
        </form>
        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showChanged}
        >
          <div className="modal notification" data-testid="modalPassword">
            {t('changePassword.done')}
          </div>
        </Modal>
      </div>
    );
  }

  _onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        () => this.setState({ passwordError: true }),
      );
    }
  }

  _onBlur() {
    this._checkValues();
  }

  _onChange(oldValue: string, firstValue: string, secondValue: string) {
    const buttonDisabled = this._isDisabledButton(
      oldValue,
      firstValue,
      secondValue,
    );
    this.setState({ oldValue, firstValue, secondValue, buttonDisabled });
  }

  _onChangeFist(e: React.ChangeEvent<HTMLInputElement>) {
    const firstValue = e.target.value;
    const { oldValue, secondValue } = this.state;
    this._onChange(oldValue, firstValue, secondValue);
  }

  _onChangeSecond(e: React.ChangeEvent<HTMLInputElement>) {
    const secondValue = e.target.value;
    const { oldValue, firstValue } = this.state;
    this._onChange(oldValue, firstValue, secondValue);
  }

  _onChangeOld(e: React.ChangeEvent<HTMLInputElement>) {
    const oldValue = e.target.value;
    const { secondValue, firstValue } = this.state;
    this._onChange(oldValue, firstValue, secondValue);
  }

  _isDisabledButton(oldValue: string, firstValue: string, secondValue: string) {
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

export const ChangePassword = withTranslation()(ChangePasswordComponent);
