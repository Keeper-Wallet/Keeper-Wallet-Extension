import * as styles from './styles/assets.styl';
import * as React from 'react';
import { connect } from 'react-redux';
import { ActiveWallet, WalletItem } from '../wallets';
import { Trans } from 'react-i18next';
import {
  getAsset,
  selectAccount,
  setActiveAccount,
  setUiState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal } from '../ui';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { IAssetInfo } from '@waves/data-entities/dist/entities/Asset';

interface Account {
  address: string;
  name: string;
  type: string;
}

interface Balance {
  available: string;
  leasedOut: string;
}

interface Props {
  accounts: Account[];
  activeAccount: Account;
  assets: Record<'WAVES', IAssetInfo>;
  balances: Record<string, Balance>;
  getAsset: (assetId: string) => unknown;
  notifications: { deleted?: boolean };
  selectAccount: (account: Account) => void;
  setActiveAccount: (account: Account) => void;
  setTab: (newTab: string) => void;
  setUiState: (newUiState: unknown) => void;
  showUpdateInfo: boolean;
}

interface State {
  balances?: Record<string, Balance>;
  deletedNotify?: boolean;
  lease?: Record<string, Balance>;
  loading?: boolean;
  name?: string;
  showActivated?: boolean;
  showCopy?: boolean;
}

export const Assets = connect(
  (store: any) => ({
    activeAccount: store.accounts.find(
      ({ address }) => address === store.selectedAccount.address
    ),
    accounts: store.accounts,
    balances: store.balances,
    assets: store.assets,
    notifications: store.localState.notifications,
    showUpdateInfo:
      !store.uiState.isFeatureUpdateShown && !!store.accounts.length,
  }),
  {
    getAsset,
    selectAccount,
    setActiveAccount,
    setUiState,
  }
)(
  class Assets extends React.Component<Props, State> {
    state: State = {};

    static getDerivedStateFromProps(props: Props): Partial<State> | null {
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

    render() {
      if (this.state.loading) {
        return <Intro />;
      }

      const { address: activeAddress } = this.props.activeAccount;

      const onSelectHandler = account => {
        this.props.setActiveAccount(account);
        this.props.setTab(PAGES.ACCOUNT_INFO);
      };

      const otherAccounts = this.props.accounts.filter(
        account => account.address !== activeAddress
      );

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
                account={this.props.activeAccount}
                active
                balance={this.state.balances[activeAddress]}
                leaseBalance={this.state.lease[activeAddress]}
                onCopy={() => {
                  this.setState({ showCopy: true });
                  setTimeout(() => this.setState({ showCopy: false }), 1000);
                }}
                onSelect={onSelectHandler}
                onShowQr={event => {
                  event.stopPropagation();
                  event.preventDefault();
                  this.props.setTab(PAGES.QR_CODE_SELECTED);
                }}
              />
            </CSSTransition>
          </TransitionGroup>
          <div className="wallets-list">
            {otherAccounts.length !== 0 && (
              <>
                <div className={`${styles.otherWalletsTitle} basic500 body3`}>
                  <Trans i18nKey="assets.inStorage">Other accounts</Trans>
                </div>

                <TransitionGroup>
                  {otherAccounts.map(account => (
                    <CSSTransition
                      key={account.address}
                      classNames="animate_wallets"
                      timeout={600}
                    >
                      <WalletItem
                        account={account}
                        active={false}
                        balance={this.state.balances[account.address]}
                        leaseBalance={this.state.lease[account.address]}
                        onSelect={onSelectHandler}
                        onActive={account => {
                          this.props.selectAccount(account);
                          this.setState({
                            showActivated: true,
                            name: account.name,
                          });
                          setTimeout(
                            () => this.setState({ showActivated: false }),
                            1000
                          );
                        }}
                      />
                    </CSSTransition>
                  ))}
                </TransitionGroup>
              </>
            )}

            <div
              className={`body1 basic500 border-dashed ${styles.addAccount}`}
              onClick={() => this.props.setTab(PAGES.IMPORT_FROM_ASSETS)}
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
            <div className="modal notification active-asset">
              <div>
                <Trans i18nKey="assets.setActive">Active account changed</Trans>
              </div>
            </div>
          </Modal>

          <Modal
            animation={Modal.ANIMATION.FLASH_SCALE}
            showModal={this.state.deletedNotify}
          >
            <div className="modal notification active-asset">
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
              onClose={() => {
                this.props.setUiState({ isFeatureUpdateShown: true });
              }}
              onSubmit={() => {
                this.props.setUiState({ isFeatureUpdateShown: true });
                this.props.setTab(PAGES.EXPORT_ACCOUNTS);
              }}
            />
          </Modal>
        </div>
      );
    }
  }
);
