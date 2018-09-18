import * as styles from './styles/deleteAccount.styl';
import * as React from 'react'
import {connect} from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { Button } from '../ui/buttons';
import { deleteActiveAccount } from '../../actions';

@translate()
class DeleteActiveAccountComponent extends React.Component {
    props;
    onClickHandler = () => this.props.deleteActiveAccount(null);

    render() {
        return <div className={styles.deleteAccount}>
              <div>
                  <h1>
                      <Trans i18nKey='deleteAccount.attention'>Attention!</Trans>
                  </h1>
                  <div>
                      <Trans i18nkey='deleteAccount.warn'>
                          Deleting an account will lead to its irretrievable loss!
                      </Trans>
                  </div>
                  <div>
                      <Button onClick={this.onClickHandler} type='warning"'>
                          <Trans i18nKey='deleteAccount.delete'>Delete account</Trans>
                      </Button>
                  </div>
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
