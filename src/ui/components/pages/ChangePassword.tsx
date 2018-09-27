import * as styles from './styles/changePassword.styl';
import { connect } from 'react-redux';
import { changePassword } from '../../actions';
import * as React from 'react'
import { Input, Error, Button, Modal } from '../ui';
import background from '../../services/Background';
import { translate, Trans } from 'react-i18next';
import { PAGES } from '../../pageConfig';

const MIN_LENGTH = 6;

const mapStateToProps = function (store: any) {
    return {
        account: store.localState.changePassword
    };
};

@translate('extension')
class ChangePasswordComponent extends React.PureComponent {

    inputEl: Input;
    state = {
        firstValue: '',
        secondValue: '',
        oldValue: '',
        oldError: null,
        firstError: null,
        secondError: null,
        buttonDisabled: true,
        passwordError: false,
        showChanged: false,
    };
    props: {
        changePassword: (p1: string, p2: string) => void;
    };

    getRef = input => this.inputEl = input;
    onFirstBlur = () => this._onBlur();
    onSecondBlur = () => this._onBlur();
    onOldBlur = () => this._onBlur();
    onChangeFist = e => this._onChangeFist(e);
    onChangeSecond = e => this._onChangeSecond(e);
    onChangeOld = e => this._onChangeOld(e);
    onSubmit = (e) => this._onSubmit(e);


    componentDidMount() {
        this.inputEl.focus();
    }

    render() {
        return <div className={styles.newPassword}>
            <form className={styles.content} onSubmit={this.onSubmit}>
                <h2 className="title1 margin2">
                    <Trans i18nKey='changePassword.changeTitle'>Change password</Trans>
                </h2>
                <div>


                    <div className="margin1 relative">
                        <div className="basic500 tag1 input-title">
                            <Trans i18nKey='changePassword.oldPassword'>Old password</Trans>
                        </div>
                        <Input id='old'
                               className="margin1"
                               type="password"
                               onChange={this.onChangeOld}
                               onBlur={this.onOldBlur}
                               error={!!this.state.oldError}
                               ref={this.getRef}
                        />
                        <Error>
                            <Trans i18nKey='changePassword.errorWrongOld'>Wrong password</Trans>
                        </Error>
                    </div>

                    <div className="margin1 relative">
                        <div className="basic500 tag1 input-title">
                            <Trans i18nKey='changePassword.newPassword'>New password</Trans>
                        </div>
                        <Input id='first'
                               className="margin1"
                               type="password"
                               onBlur={this.onFirstBlur}
                               onChange={this.onChangeFist}
                               error={!!this.state.firstError}
                        />
                        <Error>
                            <Trans i18nKey='changePassword.errorShortNew'>Name is required</Trans>
                        </Error>
                    </div>

                    <div className="margin1 relative">
                        <div className="basic500 tag1 input-title">
                            <Trans i18nKey='changePassword.confirmPassword'>Confirm password</Trans>
                        </div>
                        <Input id='second'
                               className="margin1"
                               type="password"
                               onBlur={this.onSecondBlur}
                               onChange={this.onChangeSecond}
                               error={!!this.state.secondError}
                        />
                        <Error>
                            <Trans i18nKey='changePassword.errorWrongConfirm'>New passwords not match</Trans>
                        </Error>
                    </div>

                </div>
                <Button type='submit' disabled={this.state.buttonDisabled}>
                    <Trans i18nKey='changePassword.create'>Save</Trans>
                </Button>
            </form>

            <Modal showModal={this.state.showChanged} showChildrenOnly={true}>
                <div className="modal notification">
                    <Trans i18nKey="accountInfo.copied">Copied!</Trans>
                </div>
            </Modal>

            <Modal showModal={this.state.oldError} showChildrenOnly={true}>
                <div className="modal notification error">
                    <Trans i18nKey="accountInfo.passwordError">Incorrect password</Trans>
                </div>
            </Modal>

        </div>
    }

    _onSubmit(e) {
        e.preventDefault();
        e.preventDefault();

        if (!this.state.passwordError && this.state.firstValue) {
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
                    });

                    setTimeout(() => this.setState({ showChanged: false }), 1000);
                },
                () => this.setState({ oldError: true })
            );
        }
    }
    
    _onBlur() {
        this._checkValues();
    }

    _onChangeFist(e) {
        const firstValue = e.target.value;
        this.setState({ firstValue });
        const buttonDisabled = this._isDisabledButton();
        this.setState({ buttonDisabled });
    }

    _onChangeSecond(e) {
        const secondValue = e.target.value;
        this.setState({ secondValue });
        const buttonDisabled = this._isDisabledButton();
        this.setState({ buttonDisabled });
    }

    _onChangeOld(e) {
        const oldValue = e.target.value;
        this.setState({ oldValue });
        const buttonDisabled = this._isDisabledButton();
        this.setState({ buttonDisabled });
    }

    _isDisabledButton() {

        const { oldValue, firstValue, secondValue } = this.state;

        if (!oldValue || !firstValue || !secondValue) {
            return true;
        }

        if (oldValue.length < MIN_LENGTH) {
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

export const ChangePassword = connect(mapStateToProps, { changePassword })(ChangePasswordComponent);
