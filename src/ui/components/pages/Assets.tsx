import * as styles from './styles/assets.styl';
import * as React from 'react';
import { useState } from 'react';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { useTranslation } from 'react-i18next';
import {
  getBalances,
  navigate,
  setActiveAccount,
  setSwapScreenInitialState,
} from 'ui/actions';
import { PAGES } from 'ui/pageConfig';
import { Asset, Money } from '@waves/data-entities';
import BigNumber from '@waves/bignumber';
import { Modal, Tab, TabList, TabPanels, Tabs } from 'ui/components/ui';
import { LoadingScreen } from './loadingScreen';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { AssetInfo } from './assets/assetInfo';
import { TabAssets } from './assets/tabs/tabAssets';
import { TabNfts } from './assets/tabs/tabNfts';
import { TabTxHistory } from './assets/tabs/tabTxHistory';
import { useUiState } from 'ui/components/pages/assets/tabs/helpers';
import { AssetDetail } from 'assets/types';

export function Assets() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );
  const assets = useAppSelector(state => state.assets);
  const usdPrices = useAppSelector(state => state.usdPrices);
  const balances = useAppSelector(state => state.balances);
  const notifications = useAppSelector(state => state.localState.notifications);

  const [activeTab, setActiveTab] = useUiState('assetsTab');

  const [showAsset, setShowAsset] = useState(false);
  const [showCopy, setShowCopy] = React.useState(false);

  const [currentAsset, setCurrentAsset] = useUiState('currentAsset');

  const address = activeAccount && activeAccount.address;

  React.useEffect(() => {
    setCurrentAsset(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!balances[address!]) {
      dispatch(getBalances());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  if (!activeAccount) {
    return <LoadingScreen />;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const amountInUsd = balances[address!]?.assets
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.entries(balances[address!]!.assets!).reduce(
        (acc, [id, { balance }]) => {
          if (assets[id] && usdPrices[id]) {
            const tokens = new Money(
              balance,
              new Asset(assets[id])
            ).getTokens();
            acc = acc.add(new BigNumber(usdPrices[id]).mul(tokens));
          }

          return acc;
        },
        new BigNumber(0)
      )
    : null;

  return (
    <div data-testid="assetsForm" className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          wavesBalance={
            assets['WAVES'] &&
            new Money(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              balances[address!]?.available || 0,
              new Asset(assets['WAVES'])
            )
          }
          amountInUsd={amountInUsd}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onSwapClick={() => {
            dispatch(navigate(PAGES.SWAP));
          }}
          onOtherAccountsClick={() => {
            dispatch(navigate(PAGES.OTHER_ACCOUNTS));
          }}
          onClick={account => {
            dispatch(setActiveAccount(account));
            dispatch(navigate(PAGES.ACCOUNT_INFO));
          }}
          onShowQr={() => {
            dispatch(navigate(PAGES.QR_CODE_SELECTED));
          }}
        />
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
        <TabList className="flex body3">
          <Tab className={styles.tabItem}>{t('assets.assets')}</Tab>
          <Tab className={styles.tabItem}>{t('assets.nfts')}</Tab>
          <Tab className={styles.tabItem}>{t('assets.history')}</Tab>
        </TabList>
        <TabPanels className={styles.tabPanels}>
          <TabAssets
            onInfoClick={assetId => {
              setCurrentAsset(assets[assetId]);
              setShowAsset(true);
            }}
            onSendClick={assetId => {
              setCurrentAsset(assets[assetId]);
              dispatch(navigate(PAGES.SEND));
            }}
            onSwapClick={assetId => {
              dispatch(setSwapScreenInitialState({ fromAssetId: assetId }));
              dispatch(navigate(PAGES.SWAP));
            }}
          />
          <TabNfts />
          <TabTxHistory />
        </TabPanels>
      </Tabs>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">{t('assets.copied')}</div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.selected}
      >
        <div className="modal notification">
          <div>{t('assets.selectAccountNotification')}</div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.deleted}
      >
        <div className="modal notification active-asset">
          <div>{t('assets.deleteAccount')}</div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH}
        showModal={currentAsset && showAsset}
        onExited={() => setCurrentAsset(null)}
      >
        <AssetInfo
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          asset={currentAsset! as AssetDetail}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onClose={() => setShowAsset(false)}
        />
      </Modal>
    </div>
  );
}
