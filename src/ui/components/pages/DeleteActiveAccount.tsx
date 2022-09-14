import * as styles from './styles/deleteAccount.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button } from '../ui';
import { deleteActiveAccount } from '../../actions';

interface DispatchProps {
  deleteActiveAccount: () => void;
}

type Props = WithTranslation & DispatchProps;

interface State {
  disable: boolean;
}

class DeleteActiveAccountComponent extends React.Component<Props, State> {
  state: State = { disable: false };

  onClickHandler = () => {
    this.props.deleteActiveAccount();
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

const mapStateToProps = () => {
  return {};
};

export const DeleteActiveAccount = connect(
  mapStateToProps,
  actions
)(withTranslation()(DeleteActiveAccountComponent));
