import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import { Avatar, Balance, Button, CopyText, Error, Input, Modal } from '../ui';
import background from '../../services/Background';
import { getAsset } from '../../actions/assets';
import { WithNavigate, withNavigate } from '../../router';
import { Asset, Money } from '@waves/data-entities';
import { POPUP_PAGES } from '../../pages';
import { getAccountLink } from '../../urls';
import { BigNumber } from '@waves/bignumber';
import { AppState } from 'ui/store';
import { NotificationsState } from 'ui/reducers/localState';
import { PreferencesAccount } from 'preferences/types';
import { NetworkName } from 'networks/types';
import { AssetDetail } from 'assets/types';
import { BalancesItem } from 'balances/types';

interface StateProps {
  assets: Record<string, AssetDetail>;
  balances: Partial<Record<string, BalancesItem>>;
  currentNetwork: NetworkName;
  customCodes: Partial<Record<NetworkName, string | null>>;
  network: NetworkName;
  networks: Array<{
    name: string;
    code: string;
    server: string;
    matcher: string;
  }>;
  notifications: NotificationsState;
  selectedAccount: PreferencesAccount | undefined;
}

interface DispatchProps {
  getAsset: (assetId: string) => void;
}

type Props = WithTranslation & StateProps & DispatchProps & WithNavigate;

interface State {
  balance?: Money | string | BigNumber | null;
  leaseBalance?: Money;
  balances?: unknown;
  changeNameNotify?: boolean;
  password?: string;
  passwordError?: boolean;
  showPassword?: boolean;
  showCopied?: boolean;
}

class AccountInfoComponent extends React.Component<Props, State> {
  state: State = {};
  copiedTimer: ReturnType<typeof setTimeout> | undefined;
  deffer:
    | {
        reject: () => void;
        resolve: (password: string) => void;
      }
    | undefined;

  static getDerivedStateFromProps(
    props: Readonly<Props>
  ): Partial<State> | null {
    const { selectedAccount, assets, balances } = props;
    const asset = assets['WAVES'];

    if (!asset || !selectedAccount) {
      props.getAsset('WAVES');
      return { balance: null };
    }
    const assetInstance = new Asset(asset);
    const balancesMoney: Record<string, Money> = {};
    const leaseMoney: Record<string, Money> = {};

    Object.entries(balances).forEach(([key, balance]) => {
      if (!balance) {
        return null;
      }

      balancesMoney[key] = new Money(balance.available, assetInstance);
      leaseMoney[key] = new Money(balance.leasedOut, assetInstance);
    });

    const { changeName: changeNameNotify } = props.notifications;
    const balance = balancesMoney[selectedAccount?.address];
    const leaseBalance = leaseMoney[selectedAccount?.address];
    return { balance, leaseBalance, balances: balancesMoney, changeNameNotify };
  }

  confirmPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.deffer!.resolve(this.state.password!);
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  rejectPassword = () => this.deffer!.reject();

  inputPassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ password: event.target.value, passwordError: false });

  editNameHandler = () => this.props.navigate(POPUP_PAGES.CHANGE_ACCOUNT_NAME);

  onCopyHandler = () => this.setCopiedModal();

  onDeleteHandler = () => {
    this.props.navigate(POPUP_PAGES.DELETE_ACTIVE_ACCOUNT);
  };

  render() {
    const { t, selectedAccount } = this.props;

    if (!selectedAccount) {
      return null;
    }

    const { onCopyHandler } = this;
    const { leaseBalance } = this.state;
    const showLease =
      leaseBalance && leaseBalance.gt(leaseBalance.cloneWithCoins(0));
    const {
      address,
      type: accType,
      name,
      publicKey,
      networkCode,
    } = selectedAccount;

    return (
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={`flex ${styles.wallet}`}>
            <Avatar
              className={styles.avatar}
              address={address}
              type={accType}
              size={48}
            />
            <div className={styles.accountData}>
              <div>
                <Button
                  type="button"
                  view="transparent"
                  className={styles.accountName}
                  onClick={this.editNameHandler}
                >
                  <span className={`basic500 body1`}>{name}</span>
                  <i className={styles.editIcon}> </i>
                </Button>
              </div>
              <div className={`headline1 marginTop1 ${styles.balance}`}>
                <Balance
                  split={true}
                  showAsset={true}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  balance={this.state.balance!}
                  showUsdAmount
                />

                {showLease && (
                  <div
                    className={`${styles.reservedBalance} margin-main-big-top`}
                  >
                    <span>{leaseBalance.toFormat()}</span>
                    <span className="basic500 font300">
                      {t('wallet.lease')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="margin-main-top center">
            <a
              className="link black"
              href={getAccountLink(networkCode, address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('accountInfo.viewInExplorer')}
            </a>
          </div>
        </div>

        <div id="accountInfoAddress" className="margin-main-big">
          <div className="input-title basic500 tag1">
            {t('accountInfo.address')}
          </div>
          <div className="input-like tag1">
            <CopyText
              text={address}
              showCopy={true}
              showText={true}
              onCopy={onCopyHandler}
            />
          </div>
        </div>

        {selectedAccount.type !== 'debug' && (
          <div id="accountInfoPublicKey" className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.pubKey')}
            </div>
            <div className={`input-like tag1 ${styles.ellipsis}`}>
              <CopyText
                text={publicKey}
                showCopy={true}
                showText={true}
                onCopy={onCopyHandler}
              />
            </div>
          </div>
        )}

        {['seed', 'encodedSeed', 'privateKey'].includes(
          selectedAccount.type
        ) && (
          <div id="accountInfoPrivateKey" className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.privKey')}
            </div>
            <div className="input-like password-input tag1">
              <CopyText
                type="key"
                getText={cb => this.getPrivateKey(cb)}
                showCopy={true}
                onCopy={onCopyHandler}
              />
            </div>
          </div>
        )}

        {selectedAccount.type === 'seed' ? (
          <div id="accountInfoBackupPhrase" className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.backUp')}
            </div>
            <div className="input-like password-input tag1">
              <CopyText
                type="key"
                getText={cb => this.getSeed(cb)}
                showCopy={true}
                onCopy={onCopyHandler}
              />
            </div>
          </div>
        ) : selectedAccount.type === 'privateKey' ? (
          <div className="margin-main-big basic500">
            <div className="input-title tag1">{t('accountInfo.backUp')}</div>

            <div>{t('accountInfo.privateKeyNoBackupPhrase')}</div>
          </div>
        ) : selectedAccount.type === 'encodedSeed' ? (
          <div id="accountInfoBackupPhrase" className="margin-main-big">
            <div className="input-title basic500 tag1">
              {t('accountInfo.encodedSeed')}
            </div>
            <div className="input-like password-input tag1">
              <CopyText
                type="key"
                getText={cb => this.getEncodedSeed(cb)}
                showCopy={true}
                onCopy={onCopyHandler}
              />
            </div>
          </div>
        ) : selectedAccount.type === 'wx' ? (
          <>
            <div className="margin-main-big">
              <div className="input-title basic500 tag1">
                {t('accountInfo.email')}
              </div>
              <div className={`input-like tag1 ${styles.ellipsis}`}>
                <CopyText
                  text={selectedAccount.username}
                  showCopy={true}
                  showText={true}
                  onCopy={onCopyHandler}
                />
              </div>
            </div>

            <div className="margin-main-big basic500">
              <div className="input-title tag1">{t('accountInfo.backUp')}</div>

              <div>{t('accountInfo.emailNoBackupPhrase')}</div>
            </div>
          </>
        ) : selectedAccount.type === 'debug' ? (
          <>
            <div className="margin-main-big basic500">
              <div className="input-title tag1">{t('accountInfo.backUp')}</div>

              <div>{t('accountInfo.debugNoBackupPhrase')}</div>
            </div>
          </>
        ) : null}

        <div className={styles.accountInfoFooter}>
          <div className={styles.deleteButton} onClick={this.onDeleteHandler}>
            <div className={`${styles.deleteIcon} delete-icon`} />
            <div>{t('deleteAccount.delete')}</div>
          </div>
        </div>

        <Modal
          animation={Modal.ANIMATION.FLASH}
          showModal={this.state.showPassword}
        >
          <div className="modal cover">
            <form
              id="enterPassword"
              className="modal-form"
              onSubmit={this.confirmPassword}
            >
              <i className={`lock-icon ${styles.lockIcon}`} />

              <div className="margin1 relative">
                <div className="basic500 tag1 input-title">
                  {t('accountInfo.password')}
                </div>
                <Input
                  autoFocus
                  type="password"
                  view="password"
                  error={this.state.passwordError}
                  wrapperClassName="margin1"
                  onChange={this.inputPassword}
                />

                <Error show={this.state.passwordError}>
                  <div className="error">{t('accountInfo.passwordError')}</div>
                </Error>
              </div>

              <Button
                id="passwordEnter"
                disabled={this.state.passwordError || !this.state.password}
                className="margin-main-big"
                type="submit"
                view="submit"
              >
                {t('accountInfo.enter')}
              </Button>

              <Button
                id="passwordCancel"
                type="button"
                onClick={this.rejectPassword}
              >
                {t('accountInfo.cancel')}
              </Button>

              <Button
                className="modal-close"
                type="button"
                view="transparent"
                onClick={this.rejectPassword}
              />
            </form>
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showCopied}
        >
          <div className="modal notification">{t('accountInfo.copied')}</div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.changeNameNotify}
        >
          <div className="modal notification active-asset" key="change_name">
            <div>{t('assets.changeName')}</div>
          </div>
        </Modal>
      </div>
    );
  }

  setCopiedModal() {
    if (this.copiedTimer != null) {
      clearTimeout(this.copiedTimer);
    }

    this.setState({ showCopied: true });
    this.copiedTimer = setTimeout(
      () => this.setState({ showCopied: false }),
      1000
    );
  }

  private requestPrivateData({
    copyCallback,
    request,
    retry,
  }: {
    copyCallback: (text: string) => void;
    request: (password: string) => Promise<string>;
    retry: () => void;
  }) {
    this.setState({ showPassword: true });

    new Promise<string>((resolve, reject) => {
      this.deffer = { resolve, reject };
    })
      .then(password => request(password))
      .then(data => {
        this.setState({ showPassword: false, passwordError: false });
        copyCallback(data);
      })
      .catch(err => {
        if (err) {
          this.setState({ passwordError: true });
          retry();
          return;
        }

        this.setState({ showPassword: false, passwordError: false });
      });
  }

  getSeed(copyCallback: (text: string) => void) {
    this.requestPrivateData({
      copyCallback,
      request: password =>
        background.getAccountSeed(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.props.selectedAccount!.address,
          this.props.network,
          password
        ),
      retry: () => this.getSeed(copyCallback),
    });
  }

  getEncodedSeed(copyCallback: (text: string) => void) {
    this.requestPrivateData({
      copyCallback,
      request: password =>
        background
          .getAccountEncodedSeed(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.props.selectedAccount!.address,
            this.props.network,
            password
          )
          .then(encodedSeed => `base58:${encodedSeed}`),
      retry: () => this.getEncodedSeed(copyCallback),
    });
  }

  getPrivateKey(copyCallback: (text: string) => void) {
    this.requestPrivateData({
      copyCallback,
      request: password =>
        background.getAccountPrivateKey(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.props.selectedAccount!.address,
          this.props.network,
          password
        ),
      retry: () => this.getPrivateKey(copyCallback),
    });
  }
}

const mapStateToProps = function (store: AppState): StateProps {
  const activeAccount = store.selectedAccount.address;
  const selected = store.localState.assets.account
    ? store.localState.assets.account.address
    : activeAccount;

  return {
    selectedAccount: store.accounts.find(({ address }) => address === selected),
    balances: store.balances,
    assets: store.assets,
    notifications: store.localState.notifications,
    network: store.currentNetwork,
    customCodes: store.customCodes,
    networks: store.networks,
    currentNetwork: store.currentNetwork,
  };
};

const actions = {
  getAsset,
};

export const AccountInfo = connect(
  mapStateToProps,
  actions
)(withTranslation()(withNavigate(AccountInfoComponent)));
