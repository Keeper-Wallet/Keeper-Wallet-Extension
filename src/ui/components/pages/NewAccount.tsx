import * as styles from './styles/newaccount.styl';
import {connect} from 'react-redux';
import {createNew} from '../../actions';
import * as React from 'react'
import {Input, Button, Error} from '../ui';
import {translate, Trans} from 'react-i18next';

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
    onChangeFist = e => this._onChangeInputs(e.target.value, this.state.secondValue);
    onChangeSecond = e => this._onChangeInputs(this.state.firstValue, e.target.value);
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
                    <div className='margin1 relative'>
                        <div className={`basic500 tag1 left input-title`}>
                            <Trans i18nKey='newAccount.createPassword'>Create a password</Trans>
                        </div>
                        <Input id='first'
                               className='margin1'
                               type="password"
                               ref={this.getRef}
                               onBlur={this.onFirstBlur}
                               onChange={this.onChangeFist}
                               error={!!this.state.firstError}/>

                        <Error hide={!this.state.firstError}>
                            <Trans i18nKey='newAccount.smallPass'>Password is small</Trans>
                        </Error>

                    </div>
                    <div className='margin1 relative'>
                        <div className={`basic500 tag1 left input-title`}>
                            <Trans i18nKey='newAccount.confirmPassword'>Confirm password</Trans>
                        </div>
                        <Input id='second'
                               className='margin1'
                               type="password"
                               onBlur={this.onSecondBlur}
                               onChange={this.onChangeSecond}
                               error={!!this.state.secondError}/>
                        <Error hide={!this.state.secondError}>
                            <Trans i18nKey='newAccount.notMatch'>Password no match</Trans>
                        </Error>
                    </div>
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
        this._checkValues(this.state.firstValue, this.state.secondValue);
    }

    _onSecondBlur() {
        this._checkValues(this.state.firstValue, this.state.secondValue);
    }


    _onChangeInputs(firstValue, secondValue) {
        this.setState({firstValue, secondValue});
        const buttonDisabled = NewAccountComponent._isDisabledButton({firstValue, secondValue});
        if (!buttonDisabled) {
            this._checkValues(firstValue, secondValue);
        }
    }

    _checkValues(firstValue, secondValue) {
        const firstError = NewAccountComponent._validateFirst(firstValue, secondValue);
        const secondError = NewAccountComponent._validateSecond(firstValue, secondValue);
        const passwordError = !!(firstError || secondError);
        const buttonDisabled = NewAccountComponent._isDisabledButton({firstValue, secondValue});
        this.setState({passwordError, firstError, secondError, buttonDisabled});
    }

    static _isDisabledButton({firstValue, secondValue}) {
        if (!firstValue || !secondValue) {
            return true;
        }

        const isFirstError = NewAccountComponent._validateFirst(firstValue, secondValue);
        const isSecondError = NewAccountComponent._validateSecond(firstValue, secondValue);

        return isFirstError || isSecondError;
    }

    static _validateFirst(firstValue, secondValue) {
        if (!firstValue) {
            return null;
        }

        if (firstValue.length < MIN_LENGTH) {
            return {error: 'isSmall'};
        }
    }

    static _validateSecond(firstValue, secondValue) {
        if (!secondValue || !firstValue) {
            return null;
        }

        if (firstValue === secondValue) {
            return null;
        }

        return {error: 'noMatch'}
    }
}

export const NewAccount = connect(mapStateToProps, {createNew})(NewAccountComponent);
