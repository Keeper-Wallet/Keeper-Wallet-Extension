import * as styles from './styles/forgotAccount.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import { deleteAccount } from '../../actions';

@translate()
class ForgotPasswordComponent extends React.Component {
    props;
    onClickHandler = () => this.props.deleteAccount(null);
    onBackHandler = () => this.props.onBack();

    render() {
        return <div className={styles.content}>
            <h2 className="title1 margin2">
                <Trans i18nKey='forgotPassword.attention'>Attention!</Trans>
            </h2>
            <div className="body1">
                <Trans i18nkey='forgotPassword.warn'>
                    If you forget your password, you must restore all your accounts from their SEEDs and set a new password.
                </Trans>
            </div>
            <div className={styles.buttonMargin}>
                <Button className="margin4" onClick={this.onClickHandler} type='warning'>
                    <Trans i18nKey='forgotPassword.restore'>Restore all</Trans>
                </Button>
            </div>
            <div className={styles.tryAgain}>
                <Button type={BUTTON_TYPE.TRANSPARENT}  onClick={this.onBackHandler}>
                    <Trans i18nKey='forgotPassword.tryAgain'>Try again</Trans>
                </Button>
            </div>
        </div>
    }
}

const actions = {
    deleteAccount
};

const mapStateToProps = function () {
    return {};
};

export const ForgotPassword = connect(mapStateToProps, actions)(ForgotPasswordComponent);
