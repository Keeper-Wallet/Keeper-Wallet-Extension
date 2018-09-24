import * as styles from './styles/newaccount.styl';
import { connect } from 'react-redux';
import { createNew } from '../../actions';
import * as React from 'react'
import { Input, Button } from '../ui';
import { translate, Trans } from 'react-i18next';

const MIN_LENGTH = 6;

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.newAccount
    };
};

@translate('extension')
class NewAccountComponent extends React.PureComponent {

    inputEl: Input;
    state = {
        firstValue: '',
        secondValue: '',
        firstError: null,
        secondError: null,
        buttonDisabled: true,
        passwordError: false,
    };
    props: {
        createNew: (pass: string) => void;
    };

    getRef = input => this.inputEl = input;
    onFirstBlur = () => this._onFirstBlur();
    onSecondBlur = () => this._onSecondBlur();
    onChangeFist = e => this._onChangeFist(e);
    onChangeSecond = e => this._onChangeSecond(e);
    onSubmit = (e) => {
        e.preventDefault();
        if (!this.state.passwordError && this.state.firstValue) {
            this.props.createNew(this.state.firstValue);
        }
    };

    componentDidMount() {
        this.inputEl.focus();
    }

    render() {
        return <div className={styles.account}>
            <form className={styles.content} onSubmit={this.onSubmit}>
                <h2 className={`title1 margin3 left`}>
                    <Trans i18nKey='newAccount.protect'>Protect Your Account</Trans>
                </h2>
                <div>
                    <div className={`basic500 tag1 left input-title`}>
                        <Trans i18nKey='newAccount.createPassword'>Create a password</Trans>
                    </div>
                    <Input id='first'
                           className={`margin3`}
                           type="password"
                           ref={this.getRef}
                           onBlur={this.onFirstBlur}
                           onChange={this.onChangeFist}
                           error={!!this.state.firstError}
                    />
                    <div className={`basic500 tag1 left input-title`}>
                        <Trans i18nKey='newAccount.confirmPassword'>Confirm password</Trans>
                    </div>
                    <Input id='second'
                           className={`margin3`}
                           type="password"
                           onBlur={this.onSecondBlur}
                           onChange={this.onChangeSecond}
                           error={!!this.state.secondError}
                    />
                </div>
                <Button type='submit' disabled={this.state.buttonDisabled}>
                    <Trans i18nKey='newAccount.create'>Continue</Trans>
                </Button>
                <div className={`tag1 left basic500 marginTop3`}>
                    <Trans i18nKey='newAccount.passinfo'>
                        The password you entered will be stored locally.
                        If you change device or lose your password,
                        you will have to repeat the process of adding accounts to Waves Keeper.
                        Waves does not store your passwords.
                    </Trans>
                </div>

            </form>

        </div>
    }

    _onFirstBlur() {
        this._checkValues();
    }

    _onSecondBlur() {
        this._checkValues();
    }

    _onChangeFist(e) {
        const buttonDisabled = this._isDisabledButton();
        const firstValue = e.target.value;
        this.setState({firstValue, buttonDisabled});
    }

    _onChangeSecond(e) {
        const buttonDisabled = this._isDisabledButton();
        const secondValue = e.target.value;
        this.setState({secondValue, buttonDisabled});
    }

    _isDisabledButton() {
        if (!this.state.firstValue || !this.state.secondValue) {
            return true;
        }

        return this.state.firstValue === this.state.secondValue && this.state.secondValue.length < MIN_LENGTH;
    }

    _checkValues() {
        const firstError = this._validateFirst();
        const secondError = this._validateSecond();
        const passwordError = !!(firstError || secondError);
        const buttonDisabled = this._isDisabledButton();
        this.setState({passwordError, firstError, secondError, buttonDisabled});
    }

    _validateFirst() {
        if (!this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue.length < MIN_LENGTH) {
            return {error: 'isSmall'};
        }
    }

    _validateSecond() {
        if (!this.state.secondValue || !this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue === this.state.secondValue) {
            return null;
        }

        return {error: 'noMatch'}
    }
}

export const NewAccount = connect(mapStateToProps, {createNew})(NewAccountComponent);
