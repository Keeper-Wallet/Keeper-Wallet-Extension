import * as styles from './styles/newaccount.styl';
import { connect } from 'react-redux';
import { createNew } from '../../actions';
import * as React from 'react'
import {Input, Button} from '../ui';
import { translate, Trans } from 'react-i18next';

const MIN_LINGTH = 6;

const mapStateToProps = function (store: any) {
    debugger;
    return {};
};

@translate('newAccount')
class NewAccountComponent extends React.Component {

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
    onSubmit = () => {
        if(!this.state.passwordError && this.state.firstValue) {
            this.props.createNew(this.state.firstValue);
        }
    };

    componentDidMount(){
        this.inputEl.focus();
    }

    render() {
        return <div className={styles.account}>
                <div className={styles.content}>
                    <h2>
                        <Trans i18nKey='protect'>Protect Your Account</Trans>
                    </h2>
                    <form onSubmit={this.onSubmit} >
                        <div>
                            <Input id='first'
                                   type="password"
                                   ref={this.getRef}
                                   onBlur={this.onFirstBlur}
                                   onChange={this.onChangeFist}
                                   error={!!this.state.firstError}
                            />
                            <Input id='second'
                                   type="password"
                                   onBlur={this.onSecondBlur}
                                   onChange={this.onChangeSecond}
                                   error={!!this.state.secondError}
                            />
                        </div>
                        <Button type='submit' disabled={this.state.buttonDisabled}>
                            <Trans i18nKey='create'>Create</Trans>
                        </Button>
                    </form>
                </div>
            </div>
    }

    _onFirstBlur () {
        this._checkValues();
    }

    _onSecondBlur() {
        this._checkValues();
    }

    _onChangeFist(e) {
        const buttonDisabled = this._isDisabledButton();
        const firstValue = e.target.value;
        this.setState({ firstValue, buttonDisabled });
    }

    _onChangeSecond(e) {
        const buttonDisabled = this._isDisabledButton();
        const secondValue = e.target.value;
        this.setState({ secondValue, buttonDisabled });
    }

    _isDisabledButton() {
        if (!this.state.firstValue || !this.state.secondValue) {
            return true;
        }

        return this.state.firstValue === this.state.secondValue && this.state.secondValue.length <= MIN_LINGTH;
    }

    _checkValues() {
        const firstError = this._validateFirst();
        const secondError = this._validateSecond();
        const passwordError = !!(firstError || secondError);
        const buttonDisabled = this._isDisabledButton();
        this.setState({ passwordError, firstError, secondError, buttonDisabled });
    }

    _validateFirst() {
        if (!this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue.length <= MIN_LINGTH) {
            return { error: 'isSmall' };
        }
    }

    _validateSecond() {
        if (!this.state.secondValue || !this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue === this.state.secondValue) {
            return null;
        }

        return { error: 'noMatch' }
    }
}

export const NewAccount = connect(mapStateToProps, { createNew })(NewAccountComponent);
