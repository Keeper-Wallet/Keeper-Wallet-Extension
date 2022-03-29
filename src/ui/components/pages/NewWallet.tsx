import * as styles from './styles/newwallet.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import { newAccountSelect } from '../../actions';
import { AvatarList, Button, ButtonType, ButtonView } from '../ui';
import { seedUtils } from '@waves/waves-transactions';
import { PAGES } from '../../pageConfig';

interface Account {
  address: string;
}

interface Network {
  code: string;
  name: string;
}

interface Props {
  account: Account;
  currentNetwork: string;
  customCodes: unknown;
  isGenerateNew?: boolean;
  networks: Network[];
  newAccountSelect: (newAccount: Account) => void;
  notSaveAccount: unknown;
  setTab: (newTab: string) => void;
}

class NewWalletComponent extends React.Component<Props> {
  static list = [];
  state;

  constructor(props: Props) {
    super(props);

    const { account, isGenerateNew, notSaveAccount } = props;

    const networkCode =
      this.props.customCodes[this.props.currentNetwork] ||
      this.props.networks.find(({ name }) => this.props.currentNetwork === name)
        .code ||
      '';
    if (isGenerateNew) {
      NewWalletComponent.list = NewWalletComponent.getNewWallets(networkCode);
    }

    const list = NewWalletComponent.list;

    if (notSaveAccount) {
      this._onSelect(notSaveAccount);
      this.props.setTab(PAGES.SAVE_BACKUP);
    } else {
      const selected =
        list.find(item => account && item.address === account.address) ||
        list[0];
      this._onSelect(selected);
    }

    this.state = { list };
  }

  static getNewWallets(networkCode) {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const seedData = seedUtils.Seed.create();
      const seed = seedData.phrase;
      const address = new seedUtils.Seed(seed, networkCode).address;
      list.push({ seed, address, type: 'seed' });
    }
    return list;
  }

  onSelect = account => this._onSelect(account);

  onSubmit = e => this._onSubmit(e);

  render() {
    return (
      <div className={styles.content}>
        <div>
          <h2 className={`title1 margin3 left`}>
            <Trans i18nKey="newWallet.createNew">Create New Account</Trans>
          </h2>
        </div>

        <div className={`margin3`}>
          <div className={`body3`}>
            <Trans i18nKey="newWallet.select">Choose your address avatar</Trans>
          </div>
          <div className={`tag1 basic500`}>
            <Trans i18nKey="newWallet.selectInfo">
              This avatar is unique. You cannot change it later.
            </Trans>
          </div>
        </div>

        <div className={`margin4 avatar-list`}>
          <AvatarList
            size={38}
            items={this.state.list}
            selected={this.props.account}
            onSelect={this.onSelect}
          />
        </div>

        <div className={`tag1 basic500 input-title`}>
          <Trans i18nKey="newWallet.address">Account address</Trans>
        </div>

        <div className={`${styles.greyLine} grey-line`}>
          {this.props.account.address}
        </div>

        <form onSubmit={this.onSubmit}>
          <Button
            type={ButtonType.SUBMIT}
            view={ButtonView.SUBMIT}
            id="continue"
          >
            <Trans i18nKey="newWallet.continue">Continue</Trans>
          </Button>
        </form>
      </div>
    );
  }

  _onSelect(account) {
    this.props.newAccountSelect({
      name: '',
      ...account,
      type: 'seed',
      hasBackup: false,
    });
  }

  _onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.setTab(PAGES.ACCOUNT_NAME);
  }
}

const actions = {
  newAccountSelect,
};

const mapStateToProps = function (store: any) {
  return {
    account: store.localState.newAccount,
    notSaveAccount: store.uiState.account,
    customCodes: store.customCodes,
    networks: store.networks,
    currentNetwork: store.currentNetwork,
  };
};

export const NewWallet = connect(mapStateToProps, actions)(NewWalletComponent);
