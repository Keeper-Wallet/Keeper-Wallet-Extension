import * as styles from './styles/deleteAccount.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import {translate, Trans} from 'react-i18next';
import {Button} from '../ui/buttons';
import {deleteActiveAccount} from '../../actions';
import { I18N_NAME_SPACE } from '../../appConfig';

@translate(I18N_NAME_SPACE)
class DeleteActiveAccountComponent extends React.Component {
    props;
    onClickHandler = () => this.props.deleteActiveAccount(null);

    render() {
        return <div className={styles.content}>
            <h2 className="title1 margin2">
                <Trans i18nKey='deleteAccount.attention'>Attention!</Trans>
            </h2>
            <div className="margin4 body1">
                <Trans i18nKey='deleteAccount.warn'>
                    Deleting an account will lead to its irretrievable loss!
                </Trans>
            </div>
            <div>
                <Button onClick={this.onClickHandler} type='warning'>
                    <Trans i18nKey='deleteAccount.delete'>Delete account</Trans>
                </Button>
            </div>
        </div>
    }
}

const actions = {
    deleteActiveAccount
};

const mapStateToProps = function () {
    return {};
};

export const DeleteActiveAccount = connect(mapStateToProps, actions)(DeleteActiveAccountComponent);
