import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { BigLogo } from '../head';
import {Button, Input, Error} from '../ui';
import { login } from '../../actions';

@translate('login')
class LoginComponent extends React.Component {

    inputEl: Input;
    state = {
        passwordError: false,
        password: ''
    };

    props: { login: (password) => void; error: any, pending: boolean};

    passwordError: boolean;
    onChange = (e) => this._onChange(e);
    onSubmit = () => this._onSubmit();
    getRef = input => this.inputEl = input;

    componentDidMount(){
        this.inputEl.focus();
    }

    render () {
        return <div className={styles.login}>
            <div>
                <BigLogo/>
            </div>
            <form onSubmit={this.onSubmit}>
                <div>
                    <Trans i18nKey="password">Password</Trans>
                </div>
                <div>
                    <Input type="password"
                           ref={this.getRef}
                           onChange={this.onChange}
                           error={this.state.passwordError}
                    />
                </div>
                <div>
                    <Button type='submit'
                            disabled={!this.state.password}>
                        <Trans i18nKey="enter">Enter</Trans>
                    </Button>
                </div>
            </form>
            <div>
                <Error hide={!this.state.passwordError}>
                    <Trans i18nkey='wrongPassword'>Wrong password</Trans>
                </Error>
            </div>
        </div>
    }

    _onChange(e) {
        const password = e.target.value;
        this.setState({ password, passwordError: false });
    }

    _onSubmit() {
        this.props.login(this.state.password);
    }

    static getDerivedStateFromProps(props, state) {
        const { passwordError } = state;
        const { error } = props;

        if (!passwordError && !!error) {
            return { ...state, passwordError: true };
        }

        return null;
    }
}

const actions = {
    login
};

const mapStateToProps = function({ localState }) {
    return {
        ...localState.login
    };
};

export const Login = connect(mapStateToProps, actions)(LoginComponent);
