import {
  base58Encode,
  createAddress,
  createPrivateKey,
  createPublicKey,
  generateRandomSeed,
  utf8Encode,
} from '@keeper-wallet/waves-crypto';
import { type PopupState } from 'popup/store/types';
import { Component } from 'react';
import { type WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { type NewAccountState } from 'store/reducers/localState';

import { newAccountSelect } from '../../../store/actions/localState';
import { type WithNavigate, withNavigate } from '../../router';
import { AvatarList, Button } from '../ui';
import * as styles from './styles/newwallet.styl';

interface NewWalletItem {
  address: string;
  seed: string;
  type: 'seed';
}

interface StateProps {
  account: Extract<NewAccountState, { type: 'seed' }>;
}

interface DispatchProps {
  newAccountSelect: (
    newAccount: NewWalletItem & { name: string; hasBackup: boolean },
  ) => void;
}

type Props = WithTranslation & StateProps & DispatchProps & WithNavigate;

interface State {
  list: NewWalletItem[];
}

let generatedWalletItems: NewWalletItem[] = [];

export async function generateNewWalletItems(networkCode: string) {
  const list: NewWalletItem[] = [];

  for (let i = 0; i < 5; i++) {
    const seed = generateRandomSeed();

    const privateKey = await createPrivateKey(utf8Encode(seed));
    const publicKey = await createPublicKey(privateKey);

    const address = createAddress(publicKey, networkCode.charCodeAt(0));

    list.push({
      seed,
      address: base58Encode(address),
      type: 'seed',
    });
  }

  generatedWalletItems = list;
}

class NewWalletComponent extends Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);

    const { account } = this.props;

    const selected =
      generatedWalletItems.find(
        item => account && item.address === account.address,
      ) || generatedWalletItems[0];

    this._onSelect(selected);

    this.state = { list: generatedWalletItems };
  }

  render() {
    const { t } = this.props;

    return (
      <div className={styles.content}>
        <div>
          <h2 className="title1 margin3 left">{t('newWallet.createNew')}</h2>
        </div>

        <div className="margin3">
          <div className="body3">{t('newWallet.select')}</div>
          <div className="tag1 basic500">{t('newWallet.selectInfo')}</div>
        </div>

        <div className="margin4 avatar-list">
          <AvatarList
            items={this.state.list}
            selected={this.props.account}
            size={38}
            onSelect={account => this._onSelect(account)}
          />
        </div>

        <div className="tag1 basic500 input-title">
          {t('newWallet.address')}
        </div>

        <div className={`${styles.greyLine} grey-line`}>
          {this.props.account.address}
        </div>

        <form
          onSubmit={event => {
            event.preventDefault();
            event.stopPropagation();
            this.props.navigate('/create-account/save-backup');
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
  newAccountSelect,
};

function mapStateToProps(store: PopupState): StateProps {
  return {
    account: store.localState.newAccount as Extract<
      NewAccountState,
      { type: 'seed' }
    >,
  };
}

export const NewWallet = connect(
  mapStateToProps,
  actions,
)(withTranslation()(withNavigate(NewWalletComponent)));
