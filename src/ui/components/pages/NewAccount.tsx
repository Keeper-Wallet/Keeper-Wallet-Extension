import * as styles from './styles/newaccount.styl';
import { connect } from 'react-redux';
import { createNew, setTab } from '../../actions';
import * as React from 'react';
import { Button, Error, Input } from '../ui';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CONFIG } from '../../appConfig';

const MIN_LENGTH = CONFIG.PASSWORD_MIN_LENGTH;

const mapStateToProps = function (store: any) {
  return {
    account: store.localState.newAccount,
  };
};

interface INewAccountComponentProps extends WithTranslation {
  createNew(pass: string): void;

  setTab(tab: string): void;
}

class NewAccountComponent extends React.PureComponent<INewAccountComponentProps> {
  inputEl: Input;
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
    { firstValue, secondValue },
    termsAccepted: boolean,
    conditionsAccepted: boolean
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
      secondValue
    );

    return isFirstError || isSecondError;
  }

  static _validateFirst(firstValue) {
    if (!firstValue) {
      return null;
    }

    if (firstValue.length < MIN_LENGTH) {
      return { error: 'isSmall' };
    }
  }

  static _validateSecond(firstValue, secondValue) {
    if (!secondValue || !firstValue) {
      return null;
    }

    if (firstValue === secondValue) {
      return null;
    }

    return { error: 'noMatch' };
  }

  getRef = input => (this.inputEl = input);

  onFirstBlur = () => this._onFirstBlur();

  onSecondBlur = () => this._onSecondBlur();

  onChangeFist = e =>
    this._onChangeInputs(e.target.value, this.state.secondValue);

  onChangeSecond = e =>
    this._onChangeInputs(this.state.firstValue, e.target.value);

  handleTermsAcceptedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ termsAccepted: e.currentTarget.checked }, () => {
      this._onChangeInputs(this.state.firstValue, this.state.secondValue);
    });
  };

  handleonditionsAcceptedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.setState({ conditionsAccepted: e.currentTarget.checked }, () => {
      this._onChangeInputs(this.state.firstValue, this.state.secondValue);
    });
  };

  onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.passwordError && this.state.firstValue) {
      this.props.createNew(this.state.firstValue);
    }
  };

  openTermsAndConditions = (e: React.MouseEvent): void => {
    e.preventDefault();
    this.props.setTab('conditions');
  };

  render() {
    const { t } = this.props;
    return (
      <div className={styles.account}>
        <form
          data-testid="newAccountForm"
          className={styles.content}
          onSubmit={this.onSubmit}
        >
          <h2 className={`title1 margin3 left`}>{t('newAccount.protect')}</h2>

          <div>
            <div className="margin1 relative">
              <div className={`basic500 tag1 left input-title`}>
                {t('newAccount.createPassword')}
              </div>
              <Input
                id="first"
                className="margin1"
                type="password"
                ref={this.getRef}
                onBlur={this.onFirstBlur}
                onChange={this.onChangeFist}
                error={!!this.state.firstError}
                autoFocus={true}
                autoComplete="off"
              />

              <Error show={this.state.firstError}>
                {t('newAccount.smallPass')}
              </Error>
            </div>
            <div className="margin1 relative">
              <div className={`basic500 tag1 left input-title`}>
                {t('newAccount.confirmPassword')}
              </div>
              <Input
                id="second"
                className="margin1"
                type="password"
                onBlur={this.onSecondBlur}
                onChange={this.onChangeSecond}
                error={!!this.state.secondError}
                autoComplete="off"
              />
              <Error show={this.state.secondError}>
                {t('newAccount.notMatch')}
              </Error>
            </div>
          </div>
          <div className="flex margin-main margin-main-top">
            <Input
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
          <div className="flex margin-main margin-main-top">
            <Input
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
            type="submit"
            view="submit"
            disabled={this.state.buttonDisabled}
          >
            {t('newAccount.create')}
          </Button>
          <div className={`tag1 left basic500 marginTop3`}>
            {t('newAccount.passinfo')}
          </div>
        </form>
      </div>
    );
  }

  _onFirstBlur() {
    this._checkValues(this.state.firstValue, this.state.secondValue);
  }

  _onSecondBlur() {
    this._checkValues(this.state.firstValue, this.state.secondValue);
  }

  _onChangeInputs(firstValue, secondValue) {
    this.setState({ firstValue, secondValue });
    this._checkValues(firstValue, secondValue);
  }

  _checkValues(firstValue, secondValue) {
    const { termsAccepted, conditionsAccepted } = this.state;
    const firstError = NewAccountComponent._validateFirst(firstValue);
    const secondError = NewAccountComponent._validateSecond(
      firstValue,
      secondValue
    );
    const passwordError = !!(firstError || secondError);
    const buttonDisabled = NewAccountComponent._isDisabledButton(
      {
        firstValue,
        secondValue,
      },
      termsAccepted,
      conditionsAccepted
    );

    this.setState({ passwordError, firstError, secondError, buttonDisabled });
  }
}

export const NewAccount = connect(mapStateToProps, { createNew, setTab })(
  withTranslation()(NewAccountComponent)
);
