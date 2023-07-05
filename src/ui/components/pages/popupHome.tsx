import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { type AssetDetail } from 'assets/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getBalances } from 'store/actions/balances';
import { useUiState } from 'ui/components/pages/assets/tabs/helpers';
import { Modal, Tab, TabList, TabPanels, Tabs } from 'ui/components/ui';

import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { AssetInfo } from './assets/assetInfo';
import { TabAssets } from './assets/tabs/tabAssets';
import { TabNfts } from './assets/tabs/tabNfts';
import { TabTxHistory } from './assets/tabs/tabTxHistory';
import { ImportPopup } from './Import';
import * as styles from './styles/assets.styl';

export function PopupHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const activeAccount = usePopupSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount?.address,
    ),
  );
  const assets = usePopupSelector(state => state.assets);
  const usdPrices = usePopupSelector(state => state.usdPrices);
  const balances = usePopupSelector(state => state.balances);

  const notifications = usePopupSelector(
    state => state.localState.notifications,
  );

  const [activeTab, setActiveTab] = useUiState('assetsTab');

  const [showAsset, setShowAsset] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  const [asset, setAsset] = useState<AssetDetail | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    if (!balances[activeAccount?.address!]) {
      dispatch(getBalances());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  if (!activeAccount) {
    return <ImportPopup />;
  }

  const amountInUsd = balances[activeAccount.address]?.assets
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.entries(balances[activeAccount.address]!.assets!).reduce(
        (acc, [id, { balance = 0 } = {}]) => {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const asset = assets[id];

          const usdPrice = usdPrices[id];

          if (asset && usdPrice) {
            const tokens = new Money(balance, new Asset(asset)).getTokens();
            acc = acc.add(new BigNumber(usdPrice).mul(tokens));
          }

          return acc;
        },
        new BigNumber(0),
      )
    : null;

  return (
    <div data-testid="assetsForm" className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          wavesBalance={
            assets.WAVES &&
            new Money(
              balances[activeAccount.address]?.available || 0,
              new Asset(assets.WAVES),
            )
          }
          amountInUsd={amountInUsd}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onSwapClick={() => {
            navigate('/swap');
          }}
          onOtherAccountsClick={() => {
            navigate('/other-accounts');
          }}
          onClick={account => {
            navigate(`/account-info/${account.address}`);
          }}
          onShowQr={() => {
            navigate('/qr-code');
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
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              setAsset(assets[assetId]!);
              setShowAsset(true);
            }}
            onSendClick={assetId => {
              navigate(`/send/${assetId}`);
            }}
            onSwapClick={assetId => {
              navigate(
                `/swap?${new URLSearchParams({ fromAssetId: assetId })}`,
              );
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

      {asset && (
        <Modal
          animation={Modal.ANIMATION.FLASH}
          showModal={showAsset}
          onExited={() => setAsset(null)}
        >
          <AssetInfo
            asset={asset}
            onCopy={() => {
              setShowCopy(true);
              setTimeout(() => setShowCopy(false), 1000);
            }}
            onClose={() => setShowAsset(false)}
          />
        </Modal>
      )}
    </div>
  );
}
