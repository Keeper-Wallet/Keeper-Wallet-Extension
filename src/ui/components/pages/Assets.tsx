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
  balancesMoney: Record<string, Money>;
  leaseMoney: Record<string, Money>;
  showActivated: boolean;
  showCopy: boolean;
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
    state: State = {
      balancesMoney: {},
      leaseMoney: {},
      showActivated: false,
      showCopy: false,
    };

    static getDerivedStateFromProps({
      assets,
      balances,
      getAsset,
    }: Props): Partial<State> | null {
      const assetInfo = assets['WAVES'];

      if (!assetInfo) {
        getAsset('WAVES');
        return { balancesMoney: {}, leaseMoney: {} };
      }

      const asset = new Asset(assetInfo);
      const balancesMoney: Record<string, Money> = {};
      const leaseMoney: Record<string, Money> = {};

      Object.entries<{ available: string; leasedOut: string }>(
        balances
      ).forEach(([key, { available, leasedOut }]) => {
        balancesMoney[key] = new Money(available, asset);
        leaseMoney[key] = new Money(leasedOut, asset);
      });

      return { balancesMoney, leaseMoney };
    }

    render() {
      const {
        accounts,
        activeAccount,
        notifications,
        selectAccount,
        setActiveAccount,
        setTab,
        setUiState,
        showUpdateInfo,
      } = this.props;

      const { balancesMoney, leaseMoney, showActivated, showCopy } = this.state;

      if (!activeAccount) {
        return <Intro />;
      }

      const onSelectHandler = account => {
        setActiveAccount(account);
        setTab(PAGES.ACCOUNT_INFO);
      };

      const otherAccounts = accounts.filter(
        account => account.address !== activeAccount.address
      );

      return (
        <div className={styles.assets}>
          <div className={styles.activeAccountTitle}>
            <Trans i18nKey="assets.activeAccount" />
          </div>

          <TransitionGroup className={styles.activeAnimationSpan}>
            <CSSTransition
              key={activeAccount.address}
              classNames="animate_active_wallet"
              timeout={600}
            >
              <ActiveWallet
                account={activeAccount}
                active
                balance={balancesMoney[activeAccount.address]}
                leaseBalance={leaseMoney[activeAccount.address]}
                onCopy={() => {
                  this.setState({ showCopy: true });
                  setTimeout(() => this.setState({ showCopy: false }), 1000);
                }}
                onSelect={onSelectHandler}
                onShowQr={event => {
                  event.stopPropagation();
                  event.preventDefault();
                  setTab(PAGES.QR_CODE_SELECTED);
                }}
              />
            </CSSTransition>
          </TransitionGroup>

          <div className="wallets-list">
            {otherAccounts.length !== 0 && (
              <>
                <div className={`${styles.otherWalletsTitle} basic500 body3`}>
                  <Trans i18nKey="assets.inStorage" />
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
                        balance={balancesMoney[account.address]}
                        leaseBalance={leaseMoney[account.address]}
                        onSelect={onSelectHandler}
                        onActive={account => {
                          selectAccount(account);
                          this.setState({ showActivated: true });
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
              onClick={() => setTab(PAGES.IMPORT_FROM_ASSETS)}
            >
              <Trans i18nKey="assets.addAccount" />
            </div>
          </div>

          <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
            <div className="modal notification">
              <Trans i18nKey="assets.copied" />
            </div>
          </Modal>

          <Modal
            animation={Modal.ANIMATION.FLASH_SCALE}
            showModal={showActivated}
          >
            <div className="modal notification active-asset">
              <div>
                <Trans i18nKey="assets.setActive" />
              </div>
            </div>
          </Modal>

          <Modal
            animation={Modal.ANIMATION.FLASH_SCALE}
            showModal={notifications.deleted}
          >
            <div className="modal notification active-asset">
              <div>
                <Trans i18nKey="assets.deleteAccount" />
              </div>
            </div>
          </Modal>

          <Modal animation={Modal.ANIMATION.FLASH} showModal={showUpdateInfo}>
            <FeatureUpdateInfo
              onClose={() => {
                setUiState({ isFeatureUpdateShown: true });
              }}
              onSubmit={() => {
                setUiState({ isFeatureUpdateShown: true });
                setTab(PAGES.EXPORT_ACCOUNTS);
              }}
            />
          </Modal>
        </div>
      );
    }
  }
);
