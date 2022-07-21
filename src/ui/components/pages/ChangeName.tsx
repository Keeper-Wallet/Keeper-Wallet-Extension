import styles from './styles/changeName.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { changeAccountName } from '../../actions';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button, Error, Input } from '../ui';
import { CONFIG } from '../../appConfig';
import { Account } from 'accounts/types';

interface Props extends WithTranslation {
  account: Account;
  accounts: Account[];

  changeAccountName: (updateAccount: Account) => void;
  onBack: () => void;
}

class ChangeAccountNameComponent extends React.PureComponent<Props> {
  readonly props;
  readonly state = { newName: '', error: false, errors: [] };

  static validateName(name: string, accounts) {
    const errors = [];
    const names = accounts.map(({ name }) => name);

    if (name.length < CONFIG.NAME_MIN_LENGTH) {
      errors.push({
        code: 1,
        key: 'changeName.errorRequired',
        msg: 'Required name',
      });
    }

    if (names.includes(name)) {
      errors.push({
        code: 2,
        key: 'changeName.errorInUse',
        msg: 'Name already exist',
      });
    }

    return errors;
  }

  setNewNameHandler = event => this.setNewName(event);
  onSubmit = event => this.changeName(event);

  blurHandler = () => this.onBlur();

  changeName(event) {
    event.preventDefault();
    const name = this.state.newName;
    const address = this.props.account.address;
    this.props.changeAccountName({ name, address });
    this.props.onBack();
  }

  setNewName(event) {
    const newName = event.target.value;
    const errors = ChangeAccountNameComponent.validateName(
      newName,
      this.props.accounts
    );
    this.setState({ newName, error: false, errors });
  }

  render() {
    const { t } = this.props;
    return (
      <div className={styles.content}>
        <h2 className={`title1 margin3 left`}>{t('changeName.title')}</h2>

        <div className="tag1 basic500 input-title">
          {t('changeName.currentName')}
        </div>

        <div id="currentAccountName" className="body1 font400 margin-main-big">
          {this.props.account.name}
        </div>

        <div className="separator margin-main-big"> </div>
        <form onSubmit={this.onSubmit}>
          <div className="tag1 basic500 input-title">
            {t('changeName.newName')}
          </div>

          <div className="margin-main-big relative">
            <Input
              id="newAccountName"
              onInput={this.setNewNameHandler}
              onBlur={this.blurHandler}
              error={this.state.error}
              value={this.state.newName}
              maxLength={26}
              autoFocus={true}
            />
            <Error
              show={this.state.error}
              errors={this.state.errors}
              data-testid="newAccountNameError"
            />
          </div>

          <Button
            id="save"
            type="submit"
            view="submit"
            disabled={!!this.state.errors.length || !this.state.newName}
          >
            {t('changeName.save')}
          </Button>
        </form>
      </div>
    );
  }

  onBlur() {
    const errors = ChangeAccountNameComponent.validateName(
      this.state.newName,
      this.props.accounts
    );
    this.setState({ errors, error: errors.length ? errors : null });
  }
}

const mapToProps = store => {
  const activeAccount = store.selectedAccount.address;
  const selected = store.localState.assets.account
    ? store.localState.assets.account.address
    : activeAccount;

  return {
    account: store.accounts.find(({ address }) => address === selected),
    accounts: store.accounts,
  };
};

const actions = {
  changeAccountName,
};

export const ChangeAccountName = connect(
  mapToProps,
  actions
)(withTranslation()(ChangeAccountNameComponent));
