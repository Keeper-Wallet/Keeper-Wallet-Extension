import { type AccountsState } from 'accounts/store/types';
import { PureComponent } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Background from 'ui/services/Background';

import { CONFIG } from '../../appConfig';
import { Button, ErrorMessage, Input, LangsSelect } from '../ui';
import * as styles from './NewAccount.module.css';

const MIN_LENGTH = CONFIG.PASSWORD_MIN_LENGTH;

const mapStateToProps = (state: AccountsState) => ({
  initialized: state.state?.initialized,
});

type Props = WithTranslation & ReturnType<typeof mapStateToProps>;

class NewAccountComponent extends PureComponent<Props> {
  state = {
    firstValue: '',
    secondValue: '',
    firstError: null,
    secondError: null,
    buttonDisabled: true,
    passwordError: false,
    termsAccepted: false,
    conditionsAccepted: false,
  };

  static _isDisabledButton(
    { firstValue, secondValue }: { firstValue: string; secondValue: string },
    termsAccepted: boolean,
    conditionsAccepted: boolean,
  ) {
    if (!termsAccepted || !conditionsAccepted) {
      return true;
    }

    if (!firstValue || !secondValue) {
      return true;
    }

    const isFirstError = NewAccountComponent._validateFirst(firstValue);
    const isSecondError = NewAccountComponent._validateSecond(
      firstValue,
      secondValue,
    );

    return isFirstError || isSecondError;
  }

  static _validateFirst(firstValue: string) {
    if (!firstValue) {
      return null;
    }

    if (firstValue.length < MIN_LENGTH) {
      return { error: 'isSmall' };
    }
  }

  static _validateSecond(firstValue: string, secondValue: string) {
    if (!secondValue || !firstValue) {
      return null;
    }

    if (firstValue === secondValue) {
      return null;
    }

    return { error: 'noMatch' };
  }

  onFirstBlur = () => this._onFirstBlur();

  onSecondBlur = () => this._onSecondBlur();

  onChangeFist = (e: React.ChangeEvent<HTMLInputElement>) =>
    this._onChangeInputs(e.target.value, this.state.secondValue);

  onChangeSecond = (e: React.ChangeEvent<HTMLInputElement>) =>
    this._onChangeInputs(this.state.firstValue, e.target.value);

  handleTermsAcceptedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.setState({ termsAccepted: e.currentTarget.checked }, () => {
      this._onChangeInputs(this.state.firstValue, this.state.secondValue);
    });
  };

  handleonditionsAcceptedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    this.setState({ conditionsAccepted: e.currentTarget.checked }, () => {
      this._onChangeInputs(this.state.firstValue, this.state.secondValue);
    });
  };

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.passwordError && this.state.firstValue) {
      Background.initVault(this.state.firstValue);
    }
  };

  render() {
    const { initialized, t } = this.props;

    if (initialized) {
      return <Navigate replace to="/" />;
    }

    return (
      <div className={styles.account}>
        <form
          data-testid="newAccountForm"
          className={styles.content}
          onSubmit={this.onSubmit}
        >
          <h2 className={`${styles.title} title1`}>
            {t('newAccount.protect')}
          </h2>

          <div className={styles.inner}>
            <div className="margin1 relative">
              <div className="basic500 tag1 left input-title">
                {t('newAccount.createPassword')}
              </div>
              <Input
                autoComplete="new-password"
                autoFocus
                error={!!this.state.firstError}
                id="first"
                onBlur={this.onFirstBlur}
                onChange={this.onChangeFist}
                type="password"
                view="password"
                wrapperClassName="margin1"
              />

              <ErrorMessage
                show={this.state.firstError}
                data-testid="firstError"
              >
                {t('newAccount.smallPass')}
              </ErrorMessage>
            </div>
            <div className="margin1 relative">
              <div className="basic500 tag1 left input-title">
                {t('newAccount.confirmPassword')}
              </div>
              <Input
                autoComplete="new-password"
                error={!!this.state.secondError}
                id="second"
                onBlur={this.onSecondBlur}
                onChange={this.onChangeSecond}
                type="password"
                view="password"
              />
              <ErrorMessage
                show={this.state.secondError}
                data-testid="secondError"
              >
                {t('newAccount.notMatch')}
              </ErrorMessage>
            </div>
          </div>
          <div className={styles.checkboxWrapper}>
            <Input
              wrapperClassName={styles.checkbox}
              id="termsAccepted"
              type="checkbox"
              checked={this.state.termsAccepted}
              onChange={this.handleTermsAcceptedChange}
            />
            <label htmlFor="termsAccepted">
              {t('newAccount.acceptTerms')}{' '}
              <a
                href="https://keeper-wallet.app/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('newAccount.termsAndConditions')}
              </a>
            </label>
          </div>
          <div className={styles.checkboxWrapper}>
            <Input
              wrapperClassName={styles.checkbox}
              id="conditionsAccepted"
              type="checkbox"
              checked={this.state.conditionsAccepted}
              onChange={this.handleonditionsAcceptedChange}
            />
            <label htmlFor="conditionsAccepted">
              {t('newAccount.acceptTerms')}{' '}
              <a
                href="https://keeper-wallet.app/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('newAccount.privacyPolicy')}
              </a>
            </label>
          </div>

          <Button
            className={styles.button}
            type="submit"
            view="submit"
            disabled={this.state.buttonDisabled}
          >
            {t('newAccount.create')}
          </Button>
          <div className={`${styles.text} tag1 basic500`}>
            {t('newAccount.passinfo')}
          </div>
        </form>
        <div className={styles.footer}>
          <LangsSelect />
        </div>
      </div>
    );
  }

  _onFirstBlur() {
    this._checkValues(this.state.firstValue, this.state.secondValue);
  }

  _onSecondBlur() {
    this._checkValues(this.state.firstValue, this.state.secondValue);
  }

  _onChangeInputs(firstValue: string, secondValue: string) {
    this.setState({ firstValue, secondValue });
    this._checkValues(firstValue, secondValue);
  }

  _checkValues(firstValue: string, secondValue: string) {
    const { termsAccepted, conditionsAccepted } = this.state;
    const firstError = NewAccountComponent._validateFirst(firstValue);
    const secondError = NewAccountComponent._validateSecond(
      firstValue,
      secondValue,
    );
    const passwordError = !!(firstError || secondError);
    const buttonDisabled = NewAccountComponent._isDisabledButton(
      {
        firstValue,
        secondValue,
      },
      termsAccepted,
      conditionsAccepted,
    );

    this.setState({ passwordError, firstError, secondError, buttonDisabled });
  }
}

export const NewAccount = connect(mapStateToProps)(
  withTranslation()(NewAccountComponent),
);
