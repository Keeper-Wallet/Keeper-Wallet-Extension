import * as styles from './styles/changePassword.styl';
import { connect } from 'react-redux';
import { changePassword } from '../../actions';
import * as React from 'react';
import { Button, Error, Input, Modal } from '../ui';
import background from '../../services/Background';
import { Trans } from 'react-i18next';
import { CONFIG } from '../../appConfig';

const MIN_LENGTH = CONFIG.PASSWORD_MIN_LENGTH;

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.changePassword,
    };
};

class ChangePasswordComponent extends React.PureComponent {
    inputEl: Input;
    state = {
        firstValue: '',
        secondValue: '',
        oldValue: '',
        oldError: '',
        firstError: '',
        secondError: '',
        buttonDisabled: true,
        passwordError: false,
        showChanged: false,
        oldEqualNewError: false,
    };
    props: {
        changePassword: (p1: string, p2: string) => void;
    };

    getRef = (input) => (this.inputEl = input);
    onFirstBlur = () => this._onBlur();
    onSecondBlur = () => this._onBlur();
    onOldBlur = () => this._onBlur();
    onChangeFist = (e) => this._onChangeFist(e);
    onChangeSecond = (e) => this._onChangeSecond(e);
    onChangeOld = (e) => this._onChangeOld(e);
    onSubmit = (e) => this._onSubmit(e);

    componentDidMount() {
        //this.inputEl.focus();
    }

    render() {
        return (
            <div className={styles.newPassword}>
                <form className={styles.content} onSubmit={this.onSubmit}>
                    <h2 className="title1 margin2">
                        <Trans i18nKey="changePassword.changeTitle">Change password</Trans>
                    </h2>
                    <div>
                        <div className="margin-main-big relative">
                            <div className="basic500 tag1 input-title">
                                <Trans i18nKey="changePassword.oldPassword">Old password</Trans>
                            </div>
                            <Input
                                id="old"
                                value={this.state.oldValue}
                                type="password"
                                autoFocus={true}
                                onChange={this.onChangeOld}
                                onBlur={this.onOldBlur}
                                error={!!(this.state.oldError || this.state.passwordError)}
                                ref={this.getRef}
                            />
                            <Error show={!!(this.state.oldError || this.state.passwordError)}>
                                {this.state.oldError ? (
                                    <Trans i18nKey="changePassword.errorShortOld">Password can't be so short</Trans>
                                ) : null}
                                {this.state.passwordError ? (
                                    <Trans i18nKey="changePassword.errorWrongOld">Wrong password</Trans>
                                ) : null}
                            </Error>
                        </div>

                        <div className="margin-main-big relative">
                            <div className="basic500 tag1 input-title">
                                <Trans i18nKey="changePassword.newPassword">New password</Trans>
                            </div>
                            <Input
                                id="first"
                                value={this.state.firstValue}
                                type="password"
                                onBlur={this.onFirstBlur}
                                onChange={this.onChangeFist}
                                error={!!this.state.firstError || this.state.oldEqualNewError}
                            />
                            <Error show={!!this.state.firstError}>
                                <Trans i18nKey="changePassword.errorShortNew">Password is too short</Trans>
                            </Error>
                        </div>

                        <div className="margin-main-big relative">
                            <div className="basic500 tag1 input-title">
                                <Trans i18nKey="changePassword.confirmPassword">Confirm password</Trans>
                            </div>
                            <Input
                                id="second"
                                value={this.state.secondValue}
                                type="password"
                                onBlur={this.onSecondBlur}
                                onChange={this.onChangeSecond}
                                error={!!this.state.secondError || this.state.oldEqualNewError}
                            />
                            <Error show={!!this.state.secondError || this.state.oldEqualNewError}>
                                {this.state.oldEqualNewError ? (
                                    <Trans i18nKey="changePassword.equalPassword">Old password is equal new</Trans>
                                ) : null}
                                {this.state.secondError ? (
                                    <Trans i18nKey="changePassword.errorWrongConfirm">New passwords not match</Trans>
                                ) : null}
                            </Error>
                        </div>
                    </div>
                    <Button type="submit" disabled={this.state.buttonDisabled}>
                        <Trans i18nKey="changePassword.create">Save</Trans>
                    </Button>
                </form>
                <Modal
                    animation={Modal.ANIMATION.FLASH_SCALE}
                    showModal={this.state.showChanged}
                    showChildrenOnly={true}
                >
                    <div className="modal notification">
                        <Trans i18nKey="changePassword.done">Password changed</Trans>
                    </div>
                </Modal>
            </div>
        );
    }

    _onSubmit(e) {
        e.preventDefault();

        if (this.state.firstValue) {
            background.newPassword(this.state.oldValue, this.state.firstValue).then(
                () => {
                    this.setState({
                        firstValue: '',
                        secondValue: '',
                        oldValue: '',
                        oldError: null,
                        firstError: null,
                        secondError: null,
                        buttonDisabled: true,
                        passwordError: false,
                        showChanged: true,
                        oldEqualNewError: false,
                    });

                    setTimeout(() => this.setState({ showChanged: false }), 1000);
                },
                () => this.setState({ passwordError: true })
            );
        }
    }

    _onBlur() {
        this._checkValues();
    }

    _onChange(oldValue, firstValue, secondValue) {
        const buttonDisabled = this._isDisabledButton(oldValue, firstValue, secondValue);
        this.setState({ oldValue, firstValue, secondValue, buttonDisabled });
    }

    _onChangeFist(e) {
        const firstValue = e.target.value;
        const { oldValue, secondValue } = this.state;
        this._onChange(oldValue, firstValue, secondValue);
    }

    _onChangeSecond(e) {
        const secondValue = e.target.value;
        const { oldValue, firstValue } = this.state;
        this._onChange(oldValue, firstValue, secondValue);
    }

    _onChangeOld(e) {
        const oldValue = e.target.value;
        const { secondValue, firstValue } = this.state;
        this._onChange(oldValue, firstValue, secondValue);
    }

    _isDisabledButton(oldValue, firstValue, secondValue) {
        if (!oldValue || !firstValue || !secondValue) {
            return true;
        }

        if (oldValue.length < MIN_LENGTH) {
            return true;
        }

        return firstValue !== secondValue || secondValue.length < MIN_LENGTH || firstValue === oldValue;
    }

    _checkValues() {
        let { passwordError, firstValue, oldValue } = this.state;
        const oldError = this._validateOld();
        const firstError = this._validateFirst();
        const secondError = this._validateSecond();
        const oldEqualNewError = !firstError && !secondError && !oldError && oldValue && firstValue === oldValue;
        const buttonDisabled = oldEqualNewError || oldError || firstError || secondError || !oldValue || !firstValue;

        if (oldError) {
            passwordError = false;
        }

        this.setState({
            oldEqualNewError,
            oldError,
            firstError,
            passwordError,
            secondError,
            buttonDisabled,
        });
    }

    _validateOld() {
        if (!this.state.oldValue) {
            return null;
        }

        if (this.state.oldValue.length < MIN_LENGTH) {
            return { error: 'isSmall' };
        }
    }

    _validateFirst() {
        if (!this.state.firstValue) {
            return null;
        }

        if (this.state.firstValue.length < MIN_LENGTH) {
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

        return { error: 'noMatch' };
    }
}

export const ChangePassword = connect(mapStateToProps, { changePassword })(ChangePasswordComponent);
