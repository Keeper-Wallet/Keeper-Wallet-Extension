import * as styles from './styles/login.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { BigLogo } from '../head';
import { Button, Error, Input } from '../ui';
import { login, navigate } from '../../actions';
import { PAGES } from '../../pageConfig';
import { AppState } from 'ui/store';

interface StateProps {
  error?: unknown;
}

interface DispatchProps {
  login: (password: string) => void;
  navigate: (page: string | null) => void;
}

type Props = WithTranslation & StateProps & DispatchProps;

interface State {
  passwordError: boolean;
  password: string;
}

class LoginComponent extends React.Component<Props, State> {
  state: State = {
    passwordError: false,
    password: '',
  };

  static getDerivedStateFromProps(
    props: Readonly<Props>,
    state: State
  ): Partial<State> | null {
    const { passwordError } = state;
    const { error } = props;

    if (!passwordError && !!error) {
      return { ...state, passwordError: true };
    }

    return null;
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => this._onChange(e);

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => this._onSubmit(e);

  render() {
    const { t } = this.props;
    return (
      <div className={styles.content}>
        <div className={styles.logoMargin}>
          <BigLogo />
        </div>
        <form onSubmit={this.onSubmit}>
          <div className={`left input-title basic500 tag1`}>
            {t('login.password')}
          </div>
          <div className="margin-main-big relative">
            <Input
              id="loginPassword"
              type="password"
              view="password"
              onChange={this.onChange}
              error={this.state.passwordError}
              autoFocus={true}
              autoComplete="off"
            />
            <Error
              show={this.state.passwordError}
              data-testid="loginPasswordError"
            >
              {t('login.passwordError')}
            </Error>
          </div>
          <Button
            id="loginEnter"
            type="submit"
            view="submit"
            className="margin4"
            disabled={!this.state.password}
          >
            {t('login.enter')}
          </Button>
        </form>
        <div>
          <div
            className={styles.forgotLnk}
            onClick={() => {
              this.props.navigate(PAGES.FORGOT);
            }}
          >
            {t('login.passwordForgot')}
          </div>
        </div>
      </div>
    );
  }

  _onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;
    this.setState({ password, passwordError: false });
  }

  _onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.login(this.state.password);
  }
}

const actions = {
  login,
  navigate,
};

const mapStateToProps = function ({ localState }: AppState): StateProps {
  return {
    ...localState.login,
  };
};

export const Login = connect(
  mapStateToProps,
  actions
)(withTranslation()(LoginComponent));
