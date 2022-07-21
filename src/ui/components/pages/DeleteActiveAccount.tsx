import styles from './styles/deleteAccount.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button } from '../ui';
import { deleteActiveAccount } from '../../actions';

interface Props extends WithTranslation {
  deleteActiveAccount: (payload: unknown) => void;
}

class DeleteActiveAccountComponent extends React.Component<Props> {
  state = { disable: false };
  props;

  onClickHandler = () => {
    this.props.deleteActiveAccount(null);
    this.setState({ disable: false });
  };

  render() {
    const { t } = this.props;
    return (
      <div className={styles.content}>
        <h2 className="title1 margin2">{t('deleteAccount.attention')}</h2>
        <div className="margin4 body1">{t('deleteAccount.warn')}</div>
        <div>
          <Button
            id="deleteAccount"
            onClick={this.onClickHandler}
            type="button"
            view="warning"
            disabled={this.state.disable}
          >
            {t('deleteAccount.delete')}
          </Button>
        </div>
      </div>
    );
  }
}

const actions = {
  deleteActiveAccount,
};

const mapStateToProps = function () {
  return {};
};

export const DeleteActiveAccount = connect(
  mapStateToProps,
  actions
)(withTranslation()(DeleteActiveAccountComponent));
