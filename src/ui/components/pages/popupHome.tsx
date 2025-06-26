import BigNumber from '@waves/bignumber'
import { Asset, Money } from '@waves/data-entities'
import { type AssetDetail } from 'assets/types'
import { usePopupDispatch, usePopupSelector } from 'popup/store/react'
import { isMultichainAccount } from 'preferences/types'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getBalances } from 'store/actions/balances'
import { ACTION, createAction } from 'store/actions/constants'
import { useUiState } from 'ui/components/pages/assets/tabs/helpers'
import { Modal, Tab, TabList, TabPanels, Tabs } from 'ui/components/ui'
import { getActiveAccount } from 'ui/utils/getActiveAccount'

import { ActiveAccountCard } from '../accounts/activeAccountCard'
import { AssetInfo } from './assets/assetInfo'
import { TabAssets } from './assets/tabs/tabAssets'
import { TabNfts } from './assets/tabs/tabNfts'
import { TabTxHistory } from './assets/tabs/tabTxHistory'
import { ImportPopup } from './Import'
import * as styles from './styles/assets.styl'

const setSelectedNetworkFilter = createAction(ACTION.UPDATE_SELECTED_NETWORK_FILTER);

export function PopupHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const activeAccount = usePopupSelector(state =>
    getActiveAccount(state.accounts, state.selectedAccount),
  );
  const selectedNetworkFilter = usePopupSelector(state => state.selectedNetworkFilter);
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
    if (!activeAccount) return;
    
    if (activeAccount.accountType === 'waves') {
      if (selectedNetworkFilter !== 'waves' && 
          selectedNetworkFilter !== 'waves-testnet' && 
          selectedNetworkFilter !== 'waves-stagenet' && 
          selectedNetworkFilter !== 'custom') {
        dispatch(setSelectedNetworkFilter('waves'));
      }
    } else if (isMultichainAccount(activeAccount)) {
      if ((selectedNetworkFilter === 'waves' || 
           selectedNetworkFilter === 'waves-testnet' || 
           selectedNetworkFilter === 'waves-stagenet') && 
          !activeAccount.accounts.waves) {
        dispatch(setSelectedNetworkFilter('all'));
      }
    }
  }, [activeAccount, selectedNetworkFilter, dispatch]);
  
  const { balanceKeys, primaryBalanceKey } = useMemo(() => {
    if (!activeAccount) return { balanceKeys: [], primaryBalanceKey: null };
    
    if (selectedNetworkFilter === 'all' && isMultichainAccount(activeAccount)) {
      const keys = [];
      if (activeAccount.accounts.waves?.address) {
        keys.push(activeAccount.accounts.waves.address);
      }
      if (activeAccount.accounts.ethereum?.address || activeAccount.accounts.unit0?.address) {
        keys.push(activeAccount.accounts.ethereum?.address || activeAccount.accounts.unit0?.address);
      }
      return { 
        balanceKeys: keys.filter(Boolean), 
        primaryBalanceKey: activeAccount.accounts.ethereum?.address || activeAccount.accounts.unit0?.address || null 
      };
    }
    
    if (selectedNetworkFilter === 'unit0' || selectedNetworkFilter === 'unit0-testnet') {
      if (isMultichainAccount(activeAccount)) {
        const key = activeAccount.accounts.ethereum?.address || activeAccount.accounts.unit0?.address || null;
        return { balanceKeys: key ? [key] : [], primaryBalanceKey: key };
      } else {
        return { balanceKeys: [], primaryBalanceKey: null };
      }
    }
    
    if (selectedNetworkFilter === 'waves' || 
        selectedNetworkFilter === 'waves-testnet' || 
        selectedNetworkFilter === 'waves-stagenet' || 
        selectedNetworkFilter === 'custom') {
      if (isMultichainAccount(activeAccount)) {
        const key = activeAccount.accounts.waves?.address || null;
        return { balanceKeys: key ? [key] : [], primaryBalanceKey: key };
      } else {
        const key = activeAccount.address || null;
        return { balanceKeys: key ? [key] : [], primaryBalanceKey: key };
      }
    }
    
    return { balanceKeys: [], primaryBalanceKey: null };
  }, [activeAccount, selectedNetworkFilter]);

  const amountInUsd = useMemo(() => {
    if (!activeAccount || balanceKeys.length === 0) return new BigNumber(0);

    return balanceKeys.reduce((totalUsd, balanceKey) => {
      if (!balanceKey) return totalUsd;
      const balance = balances[balanceKey];
      if (!balance || !balance.assets) return totalUsd;

      return Object.entries(balance.assets).reduce(
        (acc, [id, assetData]) => {
          const assetBalance = assetData?.balance || 0;
          const asset = assets[id];
          const usdPrice = usdPrices[id];

          if (asset && usdPrice) {
            const tokens = new Money(assetBalance, new Asset(asset)).getTokens();
            acc = acc.add(new BigNumber(usdPrice).mul(tokens));
          }

          return acc;
        },
        totalUsd,
      );
    }, new BigNumber(0));
  }, [activeAccount, balanceKeys, balances, assets, usdPrices]);

  const wavesBalance = useMemo(() => {
    if (!activeAccount) return undefined;
    
    let targetAddress: string | null = null;
    
    if (selectedNetworkFilter === 'waves' || 
        selectedNetworkFilter === 'waves-testnet' || 
        selectedNetworkFilter === 'waves-stagenet' || 
        selectedNetworkFilter === 'custom') {
      if (isMultichainAccount(activeAccount)) {
        targetAddress = activeAccount.accounts.waves?.address || null;
      } else {
        targetAddress = activeAccount.address || null;
      }
    } else if ((selectedNetworkFilter === 'unit0' || selectedNetworkFilter === 'unit0-testnet' || selectedNetworkFilter === 'all') && isMultichainAccount(activeAccount)) {
      targetAddress = activeAccount.accounts.ethereum?.address || activeAccount.accounts.unit0?.address || null;
    }
    
    if (!targetAddress) {
      if (selectedNetworkFilter === 'waves' || 
          selectedNetworkFilter === 'waves-testnet' || 
          selectedNetworkFilter === 'waves-stagenet' || 
          selectedNetworkFilter === 'custom') {
        const wavesAsset = assets.WAVES;
        if (wavesAsset) {
          return new Money(0, new Asset(wavesAsset));
        }
      } else if (selectedNetworkFilter === 'unit0' || selectedNetworkFilter === 'unit0-testnet' || selectedNetworkFilter === 'all') {
        if (isMultichainAccount(activeAccount)) {
          const unit0Asset = assets.unit0;
          if (unit0Asset) {
            return new Money(0, new Asset(unit0Asset));
          }
        }
      }
      return undefined;
    }
    
    const accountBalance = balances[targetAddress];
    if (!accountBalance) {
      if (selectedNetworkFilter === 'waves' || 
          selectedNetworkFilter === 'waves-testnet' || 
          selectedNetworkFilter === 'waves-stagenet' || 
          selectedNetworkFilter === 'custom') {
        const wavesAsset = assets.WAVES;
        if (wavesAsset) {
          return new Money(0, new Asset(wavesAsset));
        }
      } else if (selectedNetworkFilter === 'unit0' || selectedNetworkFilter === 'unit0-testnet' || selectedNetworkFilter === 'all') {
        if (isMultichainAccount(activeAccount)) {
          const unit0Asset = assets.unit0;
          if (unit0Asset) {
            return new Money(0, new Asset(unit0Asset));
          }
        }
      }
      return undefined;
    }
    
    if (selectedNetworkFilter === 'waves' || 
        selectedNetworkFilter === 'waves-testnet' || 
        selectedNetworkFilter === 'waves-stagenet' || 
        selectedNetworkFilter === 'custom') {
      const wavesAsset = assets.WAVES;
      if (wavesAsset) {
        if (isMultichainAccount(activeAccount)) {
          const balance = accountBalance.assets?.WAVES?.balance || '0';
          return new Money(balance, new Asset(wavesAsset));
        } else {
          return new Money(accountBalance.available || accountBalance.regular || '0', new Asset(wavesAsset));
        }
      }
    } else if ((selectedNetworkFilter === 'unit0' || selectedNetworkFilter === 'unit0-testnet' || selectedNetworkFilter === 'all') && isMultichainAccount(activeAccount)) {
      const unit0Asset = assets.unit0;
      if (unit0Asset) {
        const balance = accountBalance.assets?.unit0?.balance || '0';
        return new Money(balance, new Asset(unit0Asset));
      }
    }
    
    return undefined;
  }, [activeAccount, assets, balances, selectedNetworkFilter]);
  
  useEffect(() => {
    if (balanceKeys.length === 0) return;
    
    const missingBalances = balanceKeys.filter(key => key && !balances[key]);
    if (missingBalances.length > 0) {
      dispatch(getBalances());
    }
  }, [dispatch, balanceKeys, balances]);

  if (!activeAccount) {
    return <ImportPopup />;
  }

  return (
    <div data-testid="assetsForm" className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          wavesBalance={wavesBalance}
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
            if (isMultichainAccount(account)) {
              navigate(`/account-info/${account.id}`);
            } else {
              navigate(`/account-info/${account.address}`);
            }
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
