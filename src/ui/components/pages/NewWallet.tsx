import { seedUtils } from '@waves/waves-transactions';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppState } from 'ui/store';
import { newAccountSelect } from '../../actions/localState';
import { navigate } from '../../actions/router';
import { PAGES } from '../../pageConfig';
import { AvatarList, Button } from '../ui';
import * as styles from './styles/newwallet.styl';
import { NewAccountState } from 'ui/reducers/localState';

interface NewWalletItem {
  seed: string;
  address: string | null;
  type: 'seed';
}

interface StateProps {
  account: Extract<NewAccountState, { type: 'seed' }>;
}

interface DispatchProps {
  navigate: (page: string) => void;
  newAccountSelect: (
    newAccount: NewWalletItem & { name: string; hasBackup: boolean }
  ) => void;
}

type Props = WithTranslation & StateProps & DispatchProps;

interface State {
  list: NewWalletItem[];
}

let generatedWalletItems: NewWalletItem[] = [];

export function generateNewWalletItems(networkCode: string) {
  const list: NewWalletItem[] = [];

  for (let i = 0; i < 5; i++) {
    const seed = seedUtils.Seed.create().phrase;

    list.push({
      seed,
      address: new seedUtils.Seed(seed, networkCode).address,
      type: 'seed',
    });
  }

  generatedWalletItems = list;
}

class NewWalletComponent extends React.Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const { account } = this.props;

    const selected =
      generatedWalletItems.find(
        item => account && item.address === account.address
      ) || generatedWalletItems[0];

    this._onSelect(selected);

    this.state = { list: generatedWalletItems };
  }

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
            onSelect={account => this._onSelect(account)}
          />
        </div>

        <div className={`tag1 basic500 input-title`}>
          {t('newWallet.address')}
        </div>

        <div className={`${styles.greyLine} grey-line`}>
          {this.props.account.address}
        </div>

        <form
          onSubmit={event => {
            event.preventDefault();
            event.stopPropagation();
            this.props.navigate(PAGES.SAVE_BACKUP);
          }}
        >
          <Button type="submit" view="submit" id="continue">
            {t('newWallet.continue')}
          </Button>
        </form>
      </div>
    );
  }

  _onSelect(account: NewWalletItem) {
    this.props.newAccountSelect({
      name: '',
      ...account,
      type: 'seed',
      hasBackup: false,
    });
  }
}

const actions = {
  navigate,
  newAccountSelect,
};

const mapStateToProps = function (store: AppState): StateProps {
  return {
    account: store.localState.newAccount as Extract<
      NewAccountState,
      { type: 'seed' }
    >,
  };
};

export const NewWallet = connect(
  mapStateToProps,
  actions
)(withTranslation()(NewWalletComponent));
