import * as styles from './styles/assets.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { ActiveWallet, WalletItem } from '../wallets';
import { Trans } from 'react-i18next';
import {
  getAsset,
  getBalances,
  selectAccount,
  setActiveAccount,
  setUiState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal } from '../ui';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import cn from 'classnames';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';

class AssetsComponent extends React.Component {
  props;
  state = {} as any;
  _currentActive;
  _sorted;
  _t;
  addWalletHandler = () => this.props.setTab(PAGES.IMPORT_FROM_ASSETS);
  onSelectHandler = account => this.showInfo(account);
  onSetActiveHandler = account => this.setActive(account);
  copyActiveHandler = () => this.onCopyModal();
  scrollHandler = e => {
    const value = e.target.scrollTop;
    this.setState({ topScrollMain: value > 90 });
  };
  showQrHandler = event => {
    event.stopPropagation();
    event.preventDefault();
    this.props.setTab(PAGES.QR_CODE_SELECTED);
  };

  dismissFeatureInfo = () =>
    this.props.setUiState({ isFeatureUpdateShown: true });
  exportToKeystore = () => this.props.setTab(PAGES.EXPORT_ACCOUNTS);

  render() {
    if (this.state.loading) {
      return <Intro />;
    }

    const { address: activeAddress } = this.props.activeAccount;

    const activeProps = {
      account: this.props.activeAccount,
      balance: this.state.balances[activeAddress],
      leaseBalance: this.state.lease[activeAddress],
      onSelect: this.onSelectHandler,
      onShowQr: this.showQrHandler,
      active: true,
    };

    const wallets = this.getFilteredAndSortedAccounts(activeAddress).map(
      account =>
        account ? (
          <CSSTransition
            key={`${account.address}_${account.name}_${account.type}`}
            classNames="animate_wallets"
            timeout={600}
          >
            <WalletItem
              account={account}
              active={false}
              balance={this.state.balances[account.address]}
              leaseBalance={this.state.lease[account.address]}
              key={`${account.address}_${account.name}_${account.type}`}
              onSelect={this.onSelectHandler}
              onActive={this.onSetActiveHandler}
            />
          </CSSTransition>
        ) : null
    );

    const scrollClassName = cn('scroll-container', {
      'lock-scroll': this.state.topScrollMain,
    });

    return (
      <div className={styles.assets}>
        <div className={styles.activeAccountTitle}>
          <Trans i18nKey="assets.activeAccount">Active account</Trans>
        </div>
        <TransitionGroup className={styles.activeAnimationSpan}>
          <CSSTransition
            key={activeAddress}
            classNames="animate_active_wallet"
            timeout={600}
          >
            <ActiveWallet
              onCopy={this.copyActiveHandler}
              {...activeProps}
              key={activeAddress}
            />
          </CSSTransition>
        </TransitionGroup>
        <div
          className={`${scrollClassName} wallets-list`}
          onScroll={this.scrollHandler}
        >
          <div>
            {wallets.length ? (
              <div className={`${styles.otherWalletsTitle} basic500 body3`}>
                <Trans i18nKey="assets.inStorage">Other accounts</Trans>
              </div>
            ) : null}

            <div className={styles.walletListWrapper}>
              <TransitionGroup>{wallets}</TransitionGroup>
            </div>
          </div>

          <div
            className={`body1 basic500 border-dashed ${styles.addAccount}`}
            onClick={this.addWalletHandler}
          >
            <Trans i18nKey="assets.addAccount">Add an account</Trans>
          </div>
        </div>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showCopy}
        >
          <div className="modal notification">
            <Trans i18nKey="assets.copied">Copied!</Trans>
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.showActivated}
        >
          <div
            className="modal notification active-asset"
            key={this.state.name}
          >
            <div>
              <Trans i18nKey="assets.setActive">Active account changed</Trans>
            </div>
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH_SCALE}
          showModal={this.state.deletedNotify}
        >
          <div className="modal notification active-asset" key="deleted">
            <div>
              <Trans i18nKey="assets.deleteAccount">Delete account</Trans>
            </div>
          </div>
        </Modal>

        <Modal
          animation={Modal.ANIMATION.FLASH}
          showModal={this.props.showUpdateInfo}
        >
          <FeatureUpdateInfo
            onClose={this.dismissFeatureInfo}
            onSubmit={() => {
              this.dismissFeatureInfo();
              this.exportToKeystore();
            }}
          />
        </Modal>
      </div>
    );
  }

  getFilteredAndSortedAccounts(activeAddress) {
    if (!activeAddress) {
      return [];
    }
    this._sorted = this._sorted || [];
    const hash = {};
    this.props.accounts.forEach(account => (hash[account.address] = account));

    this._sorted = this._sorted
      .map(account => {
        const { address } = account || { address: null };
        const data = hash[address];
        delete hash[address];
        return data;
      })
      .filter(Boolean);
    delete hash[activeAddress];
    this._sorted = [...this._sorted, ...Object.values(hash).filter(Boolean)];
    this._sorted.sort((acc, acc2) => {
      const lastLogin1 = acc.lastLogin || 0;
      const lastLogin2 = acc2.lastlogin || 0;
      return lastLogin2 - lastLogin1;
    });
    if (this._currentActive === activeAddress) {
      return this._sorted;
    }

    if (!this._currentActive) {
      this._currentActive = activeAddress;
      return this._sorted;
    }

    const last = this.props.accounts.find(
      account => account.address === this._currentActive
    );
    this._sorted = this._sorted.filter(
      account => account.address !== activeAddress
    );
    this._sorted.unshift(last);
    this._currentActive = activeAddress;
    return this._sorted;
  }

  setActive(account) {
    this.props.selectAccount(account);
    this.setState({ showActivated: true, name: account.name });
    this.closeModals();
  }

  showInfo(account) {
    this.props.setActiveAccount(account);
    this.props.setTab(PAGES.ACCOUNT_INFO);
  }

  closeModals() {
    const showSelected = false;
    const showActivated = false;
    const showCopy = false;
    setTimeout(
      () => this.setState({ showSelected, showActivated, showCopy }),
      1000
    );
  }

  onCopyModal() {
    this.setState({ showCopy: true });
    this.closeModals();
  }

  static getDerivedStateFromProps(props) {
    const asset = props.assets['WAVES'];

    if (!props.activeAccount) {
      return { loading: true };
    }

    if (!asset) {
      props.getAsset('WAVES');
      return { balances: {}, lease: {}, loading: false };
    }

    const assetInstance = new Asset(asset);
    const balancesMoney = {};
    const leaseMoney = {};

    Object.entries<{ available: string; leasedOut: string }>(
      props.balances
    ).forEach(([key, balance]) => {
      if (!balance) {
        return null;
      }

      balancesMoney[key] = new Money(balance.available, assetInstance);
      leaseMoney[key] = new Money(balance.leasedOut, assetInstance);
    });

    const { deleted: deletedNotify } = props.notifications;
    return {
      balances: balancesMoney,
      lease: leaseMoney,
      loading: false,
      deletedNotify,
    };
  }
}

const mapStateToProps = function (store: any) {
  const activeAccount = store.selectedAccount.address;
  const selected = store.localState.assets.account
    ? store.localState.assets.account.address
    : activeAccount;

  return {
    selectedAccount: store.accounts.find(({ address }) => address === selected),
    activeAccount: store.accounts.find(
      ({ address }) => address === activeAccount
    ),
    accounts: store.accounts,
    balances: store.balances,
    assets: store.assets,
    notifications: store.localState.notifications,
    showUpdateInfo:
      !store.uiState.isFeatureUpdateShown && !!store.accounts.length,
  };
};

const actions = {
  getAsset,
  getBalances,
  selectAccount,
  setActiveAccount,
  setUiState,
};

export const Assets = connect(mapStateToProps, actions)(AssetsComponent);
