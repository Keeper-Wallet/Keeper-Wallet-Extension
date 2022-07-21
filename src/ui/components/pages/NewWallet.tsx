import { seedUtils } from '@waves/waves-transactions';
import { Account } from 'accounts/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppState } from 'ui/store';
import { newAccountSelect } from '../../actions';
import { PAGES } from '../../pageConfig';
import { AvatarList, Button } from '../ui';
import styles from './styles/newwallet.styl';

interface Network {
  code: string;
  name: string;
}

interface Props extends WithTranslation {
  account: Account;
  currentNetwork: string;
  customCodes: unknown;
  isGenerateNew?: boolean;
  networks: Network[];
  newAccountSelect: (newAccount: Account & { hasBackup: boolean }) => void;
  setTab: (newTab: string) => void;
}

class NewWalletComponent extends React.Component<Props> {
  static list = [];
  state;

  constructor(props: Props) {
    super(props);

    const { account, isGenerateNew } = props;

    const networkCode =
      this.props.customCodes[this.props.currentNetwork] ||
      this.props.networks.find(({ name }) => this.props.currentNetwork === name)
        .code ||
      '';
    if (isGenerateNew) {
      NewWalletComponent.list = NewWalletComponent.getNewWallets(networkCode);
    }

    const list = NewWalletComponent.list;

    const selected =
      list.find(item => account && item.address === account.address) || list[0];
    this._onSelect(selected);

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

  onSelect = (account: Account) => this._onSelect(account);

  onSubmit = e => this._onSubmit(e);

  render() {
    const { t } = this.props;
    return (
      <div className={styles.content}>
        <div>
          <h2 className={`title1 margin3 left`}>{t('newWallet.createNew')}</h2>
        </div>

        <div className={`margin3`}>
          <div className={`body3`}>{t('newWallet.select')}</div>
          <div className={`tag1 basic500`}>{t('newWallet.selectInfo')}</div>
        </div>

        <div className={`margin4 avatar-list`}>
          <AvatarList
            items={this.state.list}
            selected={this.props.account}
            size={38}
            onSelect={this.onSelect}
          />
        </div>

        <div className={`tag1 basic500 input-title`}>
          {t('newWallet.address')}
        </div>

        <div className={`${styles.greyLine} grey-line`}>
          {this.props.account.address}
        </div>

        <form onSubmit={this.onSubmit}>
          <Button type="submit" view="submit" id="continue">
            {t('newWallet.continue')}
          </Button>
        </form>
      </div>
    );
  }

  _onSelect(account: Account) {
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
    this.props.setTab(PAGES.SAVE_BACKUP);
  }
}

const actions = {
  newAccountSelect,
};

const mapStateToProps = function (store: AppState) {
  return {
    account: store.localState.newAccount,
    customCodes: store.customCodes,
    networks: store.networks,
    currentNetwork: store.currentNetwork,
  };
};

export const NewWallet = connect(
  mapStateToProps,
  actions
)(withTranslation()(NewWalletComponent));
