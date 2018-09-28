import * as styles from './styles/deleteAccount.styl';
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
            <div className="margin4 body1">
                <Trans i18nkey='forgotPassword.warn'>
                    If you forget your password, you must delete accounts and restore all your accounts from their SEEDs.
                </Trans>
            </div>
            <div>
                <Button onClick={this.onClickHandler} type='warning'>
                    <Trans i18nKey='forgotPassword.delete'>Delete accounts</Trans>
                </Button>
            </div>
            <Button type={BUTTON_TYPE.TRANSPARENT} onClick={this.onBackHandler}>
                <Trans i18nKey='forgotPassword.tryAgain'>Try again</Trans>
            </Button>
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
