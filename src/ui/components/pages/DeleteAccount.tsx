import * as styles from './styles/deleteAccount.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { Button } from '../ui';
import { deleteAccount } from '../../actions';

class DeleteAccountComponent extends React.Component {
  state = { disable: false };
  props;
  onClickHandler = () => {
    this.setState({ disable: true });
    this.props.deleteAccount(null);
  };

  render() {
    return (
      <div className={styles.content}>
        <h2 className="title1 margin2">
          <Trans i18nKey="deleteUser.attention">Attention!</Trans>
        </h2>
        <div className="margin4 body1">
          <Trans i18nKey="deleteUser.warn">
            Deleting an account may lead to irretrievable loss of access to
            funds! Always make sure you have backed up your SEEDs.
          </Trans>
        </div>
        <div>
          <Button
            id="deleteAccount"
            onClick={this.onClickHandler}
            type="warning"
            disabled={this.state.disable}
          >
            <Trans i18nKey="deleteUser.delete">Delete account</Trans>
          </Button>
        </div>
      </div>
    );
  }
}

const actions = {
  deleteAccount,
};

const mapStateToProps = function () {
  return {};
};

export const DeleteAccount = connect(
  mapStateToProps,
  actions
)(DeleteAccountComponent);
