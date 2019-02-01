import * as styles from './styles/deleteAccount.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {Button} from '../ui/buttons';
import { deleteAccount } from '../../actions';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class DeleteAccountComponent extends React.Component {
    props;
    onClickHandler = () => this.props.deleteAccount(null);

    render() {
        return <div className={styles.content}>
            <h2 className="title1 margin2">
                <Trans i18nKey='deleteUser.attention'>Attention!</Trans>
            </h2>
            <div className="margin4 body1">
                <Trans i18nKey='deleteUser.warn'>
                    Deleting an account may lead to irretrievable loss of access to funds! Always make sure you have backed up your SEEDs.
                </Trans>
            </div>
            <div>
                <Button onClick={this.onClickHandler} type='warning'>
                    <Trans i18nKey='deleteUser.delete'>Delete account</Trans>
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

export const DeleteAccount = connect(mapStateToProps, actions)(DeleteAccountComponent);
