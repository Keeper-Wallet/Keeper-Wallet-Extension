import * as React from 'react';
import { connect } from 'react-redux';
import { Trans } from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import { Avatar, Balance, Button, CopyText, Error, Input, Modal } from '../ui';
import background from '../../services/Background';
import { getAsset } from '../../actions';
import { Asset, Money } from '@waves/data-entities';
import { PAGES } from '../../pageConfig';
import { getAccountLink } from '../../urls';

class AccountInfoComponent extends React.Component {
  readonly props;
  readonly state = {} as any;
  copiedTimer;
  deffer;

  static getDerivedStateFromProps(props) {
    const { selectedAccount, assets, balances } = props;
    const asset = assets['WAVES'];

    if (!asset) {
      props.getAsset('WAVES');
      return { balance: null };
    }
    const assetInstance = new Asset(asset);
    const balancesMoney = {};
    const leaseMoney = {};

    Object.entries<{ available: string; leasedOut: string }>(balances).forEach(
      ([key, balance]) => {
        if (!balance) {
          return null;
        }

        balancesMoney[key] = new Money(balance.available, assetInstance);
        leaseMoney[key] = new Money(balance.leasedOut, assetInstance);
      }
    );

    const { changeName: changeNameNotify } = props.notifications;
    const balance = balancesMoney[selectedAccount.address];
    const leaseBalance = leaseMoney[selectedAccount.address];
    return { balance, leaseBalance, balances: balancesMoney, changeNameNotify };
  }

  confirmPassword = e => {
    e.preventDefault();
    this.deffer.resolve(this.state.password);
  };

  rejectPassword = () => this.deffer.reject();

  inputPassword = event =>
    this.setState({ password: event.target.value, passwordError: false });

  editNameHandler = () => this.props.setTab(PAGES.CHANGE_ACCOUNT_NAME);

  onCopyHandler = () => this.setCopiedModal();

  onDeleteHandler = () => {
    this.props.setTab(PAGES.DELETE_ACTIVE_ACCOUNT);
  };

  render() {
    const { selectedAccount } = this.props;
    const { onCopyHandler } = this;
    const { leaseBalance } = this.state;
    const showLease =
      leaseBalance && leaseBalance.gt(leaseBalance.cloneWithCoins(0));
    const { address, name, publicKey, networkCode } = selectedAccount;

    return (
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={`flex ${styles.wallet}`}>
            <Avatar className={styles.avatar} address={address} size={48} />
            <div className={styles.accountData}>
              <div>
                <Button
                  type="transparent"
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
                  balance={this.state.balance}
                />

                {showLease && (
                  <div
                    className={`${styles.reservedBalance} margin-main-big-top`}
                  >
                    <span>{leaseBalance.toFormat()}</span>
                    <span className="basic500 font300">
                      <Trans i18nKey="wallet.lease">Leased</Trans>
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
              <Trans i18nKey="accountInfo.viewInExplorer" />
            </a>
          </div>
        </div>

        <div id="accountInfoAddress" className="margin-main-big">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="accountInfo.address">Your address</Trans>
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

        <div id="accountInfoPublicKey" className="margin-main-big">
          <div className="input-title basic500 tag1">
            <Trans i18nKey="accountInfo.pubKey">Public key</Trans>
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

        {['seed', 'encodedSeed', 'privateKey'].includes(
          selectedAccount.type
        ) && (
          <div id="accountInfoPrivateKey" className="margin-main-big">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="accountInfo.privKey">Private key</Trans>
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
              <Trans i18nKey="accountInfo.backUp">Backup phrase</Trans>
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
            <div className="input-title tag1">
              <Trans i18nKey="accountInfo.backUp" />
            </div>

            <div>
              <Trans i18nKey="accountInfo.privateKeyNoBackupPhrase" />
            </div>
          </div>
        ) : selectedAccount.type === 'encodedSeed' ? (
          <div id="accountInfoBackupPhrase" className="margin-main-big">
            <div className="input-title basic500 tag1">
              <Trans i18nKey="accountInfo.encodedSeed" />
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
        ) : null}

        <div className={styles.accountInfoFooter}>
          <div className={styles.deleteButton} onClick={this.onDeleteHandler}>
            <div className={`${styles.deleteIcon} delete-icon`} />
            <div>
              <Trans i18nKey="deleteAccount.delete">Delete account</Trans>
            </div>
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
                  <Trans i18nKey="accountInfo.password">Password</Trans>
                </div>
                <Input
                  autoFocus
                  type="password"
                  error={this.state.passwordError}
                  className="margin1"
                  onChange={this.inputPassword}
                />

                <Error show={this.state.passwordError}>
                  <div className="error">
                    <Trans i18nKey="accountInfo.passwordError">
                      Incorrect password
                    </Trans>
                  </div>
                </Error>
              </div>

              <Button
                id="passwordEnter"
                disabled={this.state.passwordError || !this.state.password}
                className="margin-main-big"
                type="submit"
              >
                <Trans i18nKey="accountInfo.enter">Enter</Trans>
              </Button>

              <Button id="passwordCancel" onClick={this.rejectPassword}>
                <Trans i18nKey="accountInfo.cancel">Cancel</Trans>
              </Button>

              <Button
                className="modal-close"
                onClick={this.rejectPassword}
                type="transparent"
              />
            </form>
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showCopied}
        >
          <div className="modal notification">
            <Trans i18nKey="accountInfo.copied">Copied!</Trans>
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.changeNameNotify}
        >
          <div className="modal notification active-asset" key="change_name">
            <div>
              <Trans i18nKey="assets.changeName">Account name changed</Trans>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  setCopiedModal() {
    clearTimeout(this.copiedTimer);
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
          this.props.selectedAccount.address,
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
            this.props.selectedAccount.address,
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
          this.props.selectedAccount.address,
          this.props.network,
          password
        ),
      retry: () => this.getPrivateKey(copyCallback),
    });
  }
}

const mapStateToProps = function (store: any) {
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
)(AccountInfoComponent);
