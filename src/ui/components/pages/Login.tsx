import * as styles from './styles/login.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { BigLogo } from '../head';
import { Button, Error, Input } from '../ui';
import { login } from '../../actions';
import { PAGES } from '../../pageConfig';

class LoginComponent extends React.Component {
    inputEl: Input;
    state = {
        passwordError: false,
        password: '',
    };

    readonly props;

    static getDerivedStateFromProps(props, state) {
        const { passwordError } = state;
        const { error } = props;

        if (!passwordError && !!error) {
            return { ...state, passwordError: true };
        }

        return null;
    }

    onChange = (e) => this._onChange(e);

    onSubmit = (e) => this._onSubmit(e);

    getRef = (input) => (this.inputEl = input);

    forgotHandler = () => this.props.setTab(PAGES.FORGOT);

    componentDidMount() {
        //this.inputEl.focus();
    }

    render() {
        return (
            <div className={styles.content}>
                <div className={styles.logoMargin}>
                    <BigLogo />
                </div>
                <form onSubmit={this.onSubmit}>
                    <div className={`left input-title basic500 tag1`}>
                        <Trans i18nKey="login.password">Password</Trans>
                    </div>
                    <div className="margin-main-big relative">
                        <Input
                            id="loginPassword"
                            type="password"
                            ref={this.getRef}
                            onChange={this.onChange}
                            error={this.state.passwordError}
                            autoFocus={true}
                            autoComplete="off"
                        />
                        <Error show={this.state.passwordError}>
                            <Trans i18nKey="login.passwordError">Wrong password</Trans>
                        </Error>
                    </div>
                    <Button id="loginEnter" type="submit" className="margin4" disabled={!this.state.password}>
                        <Trans i18nKey="login.enter">Enter</Trans>
                    </Button>
                </form>
                <div>
                    <div className={styles.forgotLnk} onClick={this.forgotHandler}>
                        <Trans i18nKey="login.passwordForgot">I forgot password</Trans>
                    </div>
                </div>
            </div>
        );
    }

    _onChange(e) {
        const password = e.target.value;
        this.setState({ password, passwordError: false });
    }

    _onSubmit(e) {
        e.preventDefault();
        this.props.login(this.state.password);
    }
}

const actions = {
    login,
};

const mapStateToProps = function ({ localState }) {
    return {
        ...localState.login,
    };
};

export const Login = connect(mapStateToProps, actions)(LoginComponent);
