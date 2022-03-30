import * as styles from './styles/newaccount.styl';
import { connect } from 'react-redux';
import { createNew, setTab } from '../../actions';
import * as React from 'react';
import { Button, Error, Input } from '../ui';
import { Trans } from 'react-i18next';
import { CONFIG } from '../../appConfig';

const MIN_LENGTH = CONFIG.PASSWORD_MIN_LENGTH;

const mapStateToProps = function (store: any) {
  return {
    account: store.localState.newAccount,
  };
};

interface INewAccountComponentProps {
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

    const isFirstError = NewAccountComponent._validateFirst(
      firstValue,
      secondValue
    );
    const isSecondError = NewAccountComponent._validateSecond(
      firstValue,
      secondValue
    );

    return isFirstError || isSecondError;
  }

  static _validateFirst(firstValue, secondValue) {
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
    return (
      <div className={styles.account}>
        <form className={styles.content} onSubmit={this.onSubmit}>
          <h2 className={`title1 margin3 left`}>
            <Trans i18nKey="newAccount.protect">Protect Your Account</Trans>
          </h2>

          <div>
            <div className="margin1 relative">
              <div className={`basic500 tag1 left input-title`}>
                <Trans i18nKey="newAccount.createPassword">
                  Create a password
                </Trans>
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
                <Trans i18nKey="newAccount.smallPass">Password is small</Trans>
              </Error>
            </div>
            <div className="margin1 relative">
              <div className={`basic500 tag1 left input-title`}>
                <Trans i18nKey="newAccount.confirmPassword">
                  Confirm password
                </Trans>
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
                <Trans i18nKey="newAccount.notMatch" />
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
              <Trans i18nKey="newAccount.acceptTerms">
                I have read and agree with the
              </Trans>{' '}
              <a
                href="https://s3.eu-central-1.amazonaws.com/waves.tech/TERMS_OF_USE_Keeper_fin_DL_Tech_695afeecb3.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans i18nKey="newAccount.termsAndConditions">
                  Terms and Conditions
                </Trans>
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
              <Trans i18nKey="newAccount.acceptTerms">
                I have read and agree with the
              </Trans>{' '}
              <a
                href="https://s3.eu-central-1.amazonaws.com/waves.tech/Privacy_Policy_Waves_Keeper_fin_DL_Tech_9ce50e1fe0.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Trans i18nKey="newAccount.privacyPolicy">Privacy Policy</Trans>
              </a>
            </label>
          </div>

          <Button
            type="submit"
            view="submit"
            disabled={this.state.buttonDisabled}
          >
            <Trans i18nKey="newAccount.create">Continue</Trans>
          </Button>
          <div className={`tag1 left basic500 marginTop3`}>
            <Trans i18nKey="newAccount.passinfo">
              The password you entered will be stored locally. If you change
              device or lose your password, you will have to repeat the process
              of adding accounts to Waves Keeper. Waves does not store your
              passwords.
            </Trans>
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
    const firstError = NewAccountComponent._validateFirst(
      firstValue,
      secondValue
    );
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
  NewAccountComponent
);
