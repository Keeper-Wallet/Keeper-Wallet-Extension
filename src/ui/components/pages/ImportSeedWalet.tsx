import * as styles from './styles/importSeed.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans, WithTranslation, withTranslation } from 'react-i18next';
import { seedUtils } from '@waves/waves-transactions';
import { clearSeedErrors, newAccountSelect } from '../../actions';
import { Button, Error, Input } from '../ui';
import { PAGES } from '../../pageConfig';

const { Seed } = seedUtils;

class ImportSeedComponent extends React.Component {
  props;
  state;
  inputEl: Input;

  constructor(props) {
    super(props);
    const { isNew } = props;
    const value = isNew ? '' : this.props.account && this.props.account.phrase;
    const networkCode =
      this.props.customCodes[this.props.currentNetwork] ||
      this.props.networks.find(({ name }) => this.props.currentNetwork === name)
        .code ||
      '';
    let seed = { address: '', phrase: '' };

    if (value.length >= 24) {
      seed = new Seed(value.trim(), networkCode);
    }

    const error = this._validate(
      { phrase: value, address: seed.address },
      true
    );
    this.state = {
      value,
      error,
      showError: false,
      existError: false,
      showExistError: false,
    };
  }

  getRef = input => (this.inputEl = input);

  onSubmit = e => this._onSubmit(e);

  onChange = e => this._changeHandler(e);

  inputBlurHandler = () => this._showError(true);

  inputFocusHandler = () => this._showError(false);

  render() {
    const address = !this.state.error ? this.props.account.address : '';
    const { t } = this.props;

    return (
      <div className={styles.content}>
        <div>
          <h2 className={'title1 margin3 left'}>
            <Trans i18nKey="importSeed.title" />
          </h2>
        </div>

        <form onSubmit={this.onSubmit}>
          <div className={'tag1 basic500 input-title'}>
            {/*{t('importSeed.newSeed')}*/}
            <Trans i18nKey="importSeed.newSeed">Wallet Seed</Trans>
          </div>

          <Input
            error={
              (this.state.error || this.state.existError) &&
              this.state.showError
            }
            ref={this.getRef}
            autoFocus={true}
            onChange={this.onChange}
            onBlur={this.inputBlurHandler}
            onFocus={this.inputFocusHandler}
            multiLine={true}
            value={this.state.value}
            className="margin5"
            placeholder={t('importSeed.inputSeed')}
          />

          <Error show={!!this.state.showExistError} className={styles.error}>
            {/*{t('importSeed.existError')}*/}
            <Trans i18nKey="importSeed.existError">Account already exist</Trans>
          </Error>

          <div className={'tag1 basic500 input-title'}>
            {/*{t('importSeed.address')}*/}
            <Trans i18nKey="importSeed.address">Account address</Trans>
          </div>

          <div className={`${styles.greyLine} grey-line`}>{address}</div>

          <Button id="importAccount" type="submit" disabled={this.state.error}>
            {/*{t('importSeed.importAccount')}*/}
            <Trans i18nKey="importSeed.importAccount">Import Account</Trans>
          </Button>
        </form>
      </div>
    );
  }

  _onSubmit(event) {
    event.preventDefault();
    if (this.state.existError) {
      this.setState({ showExistError: true });
      return null;
    }
    this.setState({ showExistError: false });
    this.props.clearSeedErrors();
    this.props.setTab(PAGES.ACCOUNT_NAME_SEED);
  }

  _validate({ phrase = '', address }, noSetState?) {
    const error = phrase.length < 25;
    const existError = !!(this.props.accounts || []).find(
      ({ address: addr }) => address === addr
    );
    if (!noSetState) {
      this.setState({ error, existError });
    }
    return error || existError;
  }

  _changeHandler(e) {
    const phrase = e.target.value || '';
    const networkCode =
      this.props.customCodes[this.props.currentNetwork] ||
      this.props.networks.find(({ name }) => this.props.currentNetwork === name)
        .code ||
      '';
    let seed = { address: '', phrase: '' };

    if (phrase.length >= 24) {
      seed = new Seed(phrase.trim(), networkCode);
    }

    this.setState({ value: phrase });
    this._validate({ phrase, address: seed.address });
    this.props.newAccountSelect({
      ...seed,
      seed: seed.phrase,
      type: 'seed',
      name: '',
      hasBackup: true,
    });
  }

  _showError(isShow) {
    this.setState({ showError: isShow });
  }
}

interface IProps extends WithTranslation {
  newAccountSelect?: any;
  clearSeedErrprs?: any;
  account?: any;
  accounts?: any;
  customCodes?: any;
  networks?: any;
  currentNetwork?: any;
}

const actions = {
  newAccountSelect,
  clearSeedErrors,
};

const mapStateToProps = function (store: any) {
  return {
    account: store.localState.newAccount,
    accounts: store.accounts,
    customCodes: store.customCodes,
    networks: store.networks,
    currentNetwork: store.currentNetwork,
  };
};

export const ImportSeed = connect(
  mapStateToProps,
  actions
)(withTranslation()(ImportSeedComponent));
