import * as styles from './styles/assets.styl';
import cn from 'classnames';
import * as React from 'react';
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
import { useAppDispatch, useAppSelector } from 'ui/store';
import { Tabs, Tab, TabList, TabPanel, TabPanels } from '../ui/Tabs/Tabs';

interface Props {
  setTab: (newTab: string) => void;
}

export function Assets({ setTab }: Props) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);

  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );

  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);
  const notifications = useAppSelector(state => state.localState.notifications);
  const showUpdateInfo = useAppSelector(
    state => !state.uiState.isFeatureUpdateShown && !!state.accounts.length
  );

  const [showActivated, setShowActivated] = React.useState(false);
  const [showCopy, setShowCopy] = React.useState(false);

  React.useEffect(() => {
    if (!assets['WAVES']) {
      dispatch(getAsset('WAVES'));
    }
  }, [assets, dispatch, getAsset]);

  if (!activeAccount) {
    return <Intro />;
  }

  const onSelectHandler = account => {
    dispatch(setActiveAccount(account));
    setTab(PAGES.ACCOUNT_INFO);
  };

  const otherAccounts = accounts.filter(
    account => account.address !== activeAccount.address
  );

  const balancesMoney: Record<string, Money> = {};
  const leaseMoney: Record<string, Money> = {};

  const assetInfo = assets['WAVES'];

  if (assetInfo) {
    const asset = new Asset(assetInfo);

    Object.entries<{ available: string; leasedOut: string }>(balances).forEach(
      ([key, { available, leasedOut }]) => {
        balancesMoney[key] = new Money(available, asset);
        leaseMoney[key] = new Money(leasedOut, asset);
      }
    );
  }

  return (
    <div className={styles.assets}>
      <div className={styles.activeAccountTitle}>
        <Trans i18nKey="assets.activeAccount" />
      </div>

      <TransitionGroup className={styles.activeAccountTransitionGroup}>
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
              setShowCopy(true);
              setTimeout(() => setShowCopy(false), 1000);
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

      <Tabs>
        <TabList className={cn(styles.tabs, 'body3')}>
          <Tab>
            <Trans i18nKey="assets.inStorage" />
          </Tab>
        </TabList>
        <TabPanels className={styles.tabPanels}>
          <TabPanel className="wallets-list">
            {otherAccounts.length !== 0 && (
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
                        dispatch(selectAccount(account));
                        setShowActivated(true);
                        setTimeout(() => setShowActivated(false), 1000);
                      }}
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            )}

            <div
              className={`body1 basic500 border-dashed ${styles.addAccount}`}
              onClick={() => setTab(PAGES.IMPORT_FROM_ASSETS)}
            >
              <Trans i18nKey="assets.addAccount" />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">
          <Trans i18nKey="assets.copied" />
        </div>
      </Modal>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showActivated}>
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
            dispatch(setUiState({ isFeatureUpdateShown: true }));
          }}
          onSubmit={() => {
            dispatch(setUiState({ isFeatureUpdateShown: true }));
            setTab(PAGES.EXPORT_ACCOUNTS);
          }}
        />
      </Modal>
    </div>
  );
}
