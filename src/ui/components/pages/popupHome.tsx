import BigNumber from '@waves/bignumber';
import { Asset, Money } from '@waves/data-entities';
import { type IAssetInfo } from '@waves/data-entities/dist/entities/Asset';
import { type AssetDetail } from 'assets/types';
import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getBalances } from 'store/actions/balances';
import { useUiState } from 'ui/components/pages/assets/tabs/helpers';
import { Modal, Tab, TabList, TabPanels, Tabs } from 'ui/components/ui';

import { BLOCKCHAIN_TYPES } from '../../../assets/constants';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { ImportPopup } from './accountHome';
import { AssetInfo } from './assets/assetInfo';
import { TabAssets } from './assets/tabs/tabAssets';
import { TabNfts } from './assets/tabs/tabNfts';
import { TabTxHistory } from './assets/tabs/tabTxHistory';
import * as styles from './styles/assets.styl';

export function PopupHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const activeAccount = usePopupSelector(state => {
    // Handle multi-chain wallet case
    if (
      state.selectedAccount?.type === 'multichain' &&
      state.selectedAccount?.walletId
    ) {
      // First try to find by walletId which is more reliable for multi-chain wallets
      const multiChainAccount = state.accounts.find(
        account => account.id === state.selectedAccount?.walletId,
      );

      if (multiChainAccount) {
        // Get current blockchain type from Redux state
        const currentBlockchainType = state.currentBlockchainType || 'waves';

        // If we need to get Unit0 address when unit0 is selected as blockchain type
        if (
          currentBlockchainType === 'unit0' &&
          multiChainAccount.coins?.unit0
        ) {
          // Use currentNetwork from Redux state
          const network = state.currentNetwork?.toLowerCase() || 'mainnet';
          // For stagenet, use testnet for Unit0 since Unit0 doesn't have stagenet
          const unit0NetworkKey = network === 'stagenet' ? 'testnet' : network;

          // Create a modified account with the Unit0 address for the current network
          return {
            ...multiChainAccount,
            address:
              multiChainAccount.coins.unit0.networks[unit0NetworkKey]
                ?.address ||
              multiChainAccount.coins.unit0.networks.mainnet?.address,
          };
        }

        // For Waves or default case, return the found account
        return multiChainAccount;
      }
    }

    // Traditional account lookup by address as fallback
    return state.accounts.find(
      ({ address }) => address === state.selectedAccount?.address,
    );
  });
  const assets = usePopupSelector(state => state.assets);
  const usdPrices = usePopupSelector(state => state.usdPrices);
  const balances = usePopupSelector(state => state.balances);
  const currentBlockchainType = usePopupSelector(
    state => state.currentBlockchainType,
  );
  const notifications = usePopupSelector(
    state => state.localState.notifications,
  );
  const unit0Asset = assets.unit0;

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

  const currentBalance = () => {
    const availableBalance = balances[activeAccount.address]?.available;
    if (
      currentBlockchainType === BLOCKCHAIN_TYPES.UNIT0 &&
      unit0Asset &&
      availableBalance
    ) {
      // Use Unit0 balance
      const assetInstance = new Asset(unit0Asset as IAssetInfo);
      return new Money(availableBalance, assetInstance);
    } else {
      return (
        assets.WAVES &&
        new Money(
          balances[activeAccount.address]?.available || 0,
          new Asset(assets.WAVES as IAssetInfo),
        )
      );
    }
  };
  const amountInUsd = balances[activeAccount.address]?.assets
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.entries(balances[activeAccount.address]!.assets!).reduce(
        (acc, [id, { balance = 0 } = {}]) => {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const asset = assets[id];

          const usdPrice = usdPrices[id];

          if (asset && usdPrice) {
            const tokens = new Money(
              balance,
              new Asset(asset as IAssetInfo),
            ).getTokens();
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
          currentBalance={currentBalance()}
          wavesBalance={
            assets.WAVES &&
            new Money(
              balances[activeAccount.address]?.available || 0,
              new Asset(assets.WAVES as IAssetInfo),
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
