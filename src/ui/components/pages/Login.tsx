import * as styles from './styles/login.styl';
import * as React from 'react'
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { BigLogo } from '../head'
import {Button, Input} from "../ui";

@translate('login')
class LoginComponent extends React.Component {

    state = {
        passwordError: false,
        password: ''
    };

    passwordError: boolean;
    onChange = (e) => this._onChange(e);
    onSubmit = () => this._onSubmit();

    render () {
        return <div className={styles.login}>
            <div>
                <BigLogo/>
            </div>
            <div>
                <Trans i18nKey="password">Password</Trans>
            </div>
            <div>
                <Input type="password"
                       onChange={this.onChange}
                       error={this.state.passwordError}
                />
            </div>
            <div>
                <Button onClick={this.onSubmit}
                        submit={true}
                        disabled={this.state.password}>
                    <Trans i18nKey="enter">Enter</Trans>
                </Button>
            </div>
        </div>
    }

    _onChange(e) {
        const password = e.target.value;
        this.setState({ password, passwordError: false });
    }

    _onSubmit() {
        
    }
}

const mapStateToProps = function(store: any) {
    return {};
};

export const Login = connect(mapStateToProps)(LoginComponent);
