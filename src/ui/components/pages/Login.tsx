import * as styles from './styles/login.styl';
import * as React from 'react'
import {translate, Trans} from 'react-i18next';
import {connect} from 'react-redux';
import {BigLogo} from '../head';
import {Button, Input, Error} from '../ui';
import {login} from '../../actions';
import { PAGES } from '../../pageConfig';

@translate('extension')
class LoginComponent extends React.Component {

    inputEl: Input;
    state = {
        passwordError: false,
        password: ''
    };

    readonly props;

    onChange = (e) => this._onChange(e);
    onSubmit = (e) => this._onSubmit(e);
    getRef = input => this.inputEl = input;
    forgotHandler = (e) => this.props.setTab(PAGES.FORGOT);

    componentDidMount() {
        this.inputEl.focus();
    }

    render() {
        return <div className={styles.content}>
            <div className={styles.logoMargin}>
                <BigLogo/>
            </div>
            <form onSubmit={this.onSubmit}>
                <div className={`left input-title basic500 tag1`}>
                    <Trans i18nKey="login.password">Password</Trans>
                </div>
                <div className="margin1 relative">
                    <Input type="password"
                           className="margin1"
                           ref={this.getRef}
                           onChange={this.onChange}
                           error={this.state.passwordError}
                    />
                    <Error show={this.state.passwordError}>
                        <Trans i18nKey="login.passwordError">Wrong password</Trans>
                    </Error>
                </div>
                <Button type='submit'
                        className="margin4"
                        disabled={!this.state.password}>
                    <Trans i18nKey="login.enter">Enter</Trans>
                </Button>
            </form>
            <div>
                <div className={`${styles.forgotLnk} link`} onClick={this.forgotHandler}>
                    <Trans i18nKey="login.passwordForgot">I forgot password</Trans>
                </div>
            </div>
        </div>
    }

    _onChange(e) {
        const password = e.target.value;
        this.setState({password, passwordError: false});
    }

    _onSubmit(e) {
        e.preventDefault();
        this.props.login(this.state.password);
    }

    static getDerivedStateFromProps(props, state) {
        const {passwordError} = state;
        const {error} = props;

        if (!passwordError && !!error) {
            return {...state, passwordError: true};
        }

        return null;
    }
}

const actions = {
    login
};

const mapStateToProps = function ({localState}) {
    return {
        ...localState.login
    };
};

export const Login = connect(mapStateToProps, actions)(LoginComponent);
