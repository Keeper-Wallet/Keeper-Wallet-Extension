import { seedUtils } from '@waves/waves-transactions';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppState } from 'ui/store';
import { newAccountSelect } from '../../actions';
import { PageComponentProps, PAGES } from '../../pageConfig';
import { AvatarList, Button } from '../ui';
import * as styles from './styles/newwallet.styl';
import { NewAccountState } from 'ui/reducers/localState';

interface Network {
  code: string;
  name: string;
}

interface SeedAccountData {
  seed: string;
  address: string | null;
  type: 'seed';
}

interface StateProps {
  account: Extract<NewAccountState, { type: 'seed' }>;
  customCodes: Record<string, string | null>;
  networks: Network[];
  currentNetwork: string;
}

interface DispatchProps {
  newAccountSelect: (
    newAccount: SeedAccountData & { name: string; hasBackup: boolean }
  ) => void;
}

type Props = PageComponentProps &
  WithTranslation &
  StateProps &
  DispatchProps & {
    isGenerateNew?: boolean;
  };

interface State {
  list: SeedAccountData[];
}

class NewWalletComponent extends React.Component<Props, State> {
  state: State;

  static list: SeedAccountData[] = [];

  constructor(props: Props) {
    super(props);

    const { account, isGenerateNew } = props;

    const networkCode =
      this.props.customCodes[this.props.currentNetwork] ||
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.props.networks.find(
        ({ name }) => this.props.currentNetwork === name
      )!.code ||
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

  static getNewWallets(networkCode: string) {
    const list: SeedAccountData[] = [];
    for (let i = 0; i < 5; i++) {
      const seedData = seedUtils.Seed.create();
      const seed = seedData.phrase;
      const address = new seedUtils.Seed(seed, networkCode).address;
      list.push({ seed, address, type: 'seed' });
    }
    return list;
  }

  onSelect = (account: SeedAccountData) => this._onSelect(account);

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => this._onSubmit(e);

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

  _onSelect(account: SeedAccountData) {
    this.props.newAccountSelect({
      name: '',
      ...account,
      type: 'seed',
      hasBackup: false,
    });
  }

  _onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.props.setTab(PAGES.SAVE_BACKUP);
  }
}

const actions = {
  newAccountSelect,
};

const mapStateToProps = function (store: AppState): StateProps {
  return {
    account: store.localState.newAccount as Extract<
      NewAccountState,
      { type: 'seed' }
    >,
    customCodes: store.customCodes,
    networks: store.networks,
    currentNetwork: store.currentNetwork,
  };
};

export const NewWallet = connect(
  mapStateToProps,
  actions
)(withTranslation()(NewWalletComponent));
