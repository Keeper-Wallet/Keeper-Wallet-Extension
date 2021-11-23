import * as styles from './styles/assets.styl';
import cn from 'classnames';
import * as React from 'react';
import { useState } from 'react';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { Trans } from 'react-i18next';
import {
  getAsset,
  getBalances,
  getHistory,
  getNfts,
  setActiveAccount,
  setUiState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import { Modal, Tab, TabList, TabPanel, TabPanels, Tabs } from '../ui';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { BigNumber } from '@waves/bignumber';
import { AssetItem } from './assets/assetItem';
import { NftItem } from './assets/nftItem';
import { AssetInfo } from './assets/assetInfo';
import { getConfigByTransaction } from '../transactions';

interface Props {
  setTab: (newTab: string) => void;
}

export function Assets({ setTab }: Props) {
  const dispatch = useAppDispatch();

  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );

  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);
  const history = useAppSelector(state => state.history);
  const nfts = useAppSelector(state => state.nfts);
  const notifications = useAppSelector(state => state.localState.notifications);
  const showUpdateInfo = useAppSelector(
    state => !state.uiState.isFeatureUpdateShown && !!state.accounts.length
  );
  const [asset, setAsset] = useState(null);
  const [showAsset, setShowAsset] = useState(false);

  const [showCopy, setShowCopy] = React.useState(false);

  React.useEffect(() => {
    if (!assets['WAVES']) {
      dispatch(getAsset('WAVES'));
    }
  }, [assets, dispatch]);

  React.useEffect(() => {
    dispatch(getNfts());
    dispatch(getHistory());
    dispatch(getBalances());
  }, []);

  if (!activeAccount) {
    return <Intro />;
  }

  const onSelectHandler = account => {
    dispatch(setActiveAccount(account));
    setTab(PAGES.ACCOUNT_INFO);
  };

  const balancesMoney: Record<string, Money> = {};

  const assetInfo = assets['WAVES'];

  if (assetInfo) {
    const asset = new Asset(assetInfo);

    Object.entries<{ available: string }>(balances).forEach(
      ([address, { available }]) => {
        balancesMoney[address] = new Money(available, asset);
      }
    );
  }

  const assetEntries = Object.entries<{ balance: string }>(
    balances[activeAccount.address]?.assets || {}
  );

  return (
    <div className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          balance={balancesMoney[activeAccount.address]}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onOtherAccountsClick={() => {
            setTab(PAGES.OTHER_ACCOUNTS);
          }}
          onClick={onSelectHandler}
          onShowQr={() => {
            setTab(PAGES.QR_CODE_SELECTED);
          }}
        />
      </div>

      <Tabs>
        <TabList className={cn(styles.tabs, 'body3')}>
          <Tab>
            <Trans i18nKey="assets.assets" />
          </Tab>
          <Tab>
            <Trans i18nKey="assets.nfts" />
          </Tab>
          <Tab>
            <Trans i18nKey="assets.history" />
          </Tab>
        </TabList>
        <TabPanels className={styles.tabPanels}>
          <TabPanel>
            {assetEntries.length === 0 ? (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyAssets" />
              </div>
            ) : (
              assetEntries.map(([assetId, { balance }]) => (
                <AssetItem
                  key={assetId}
                  balance={
                    assets &&
                    assets[assetId] &&
                    new Money(
                      new BigNumber(balance),
                      new Asset(assets[assetId])
                    )
                  }
                  assetId={assetId}
                  onClick={assetId => {
                    setAsset(assets[assetId]);
                    setShowAsset(true);
                  }}
                />
              ))
            )}
          </TabPanel>
          <TabPanel>
            {nfts.length === 0 ? (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyNFTs" />
              </div>
            ) : (
              Object.entries<Asset[]>(
                nfts.reduce(
                  (result, item) => ({
                    ...result,
                    [item.issuer]: [...(result[item.issuer] || []), item],
                  }),
                  {}
                )
              ).map(([issuer, issuerNfts], index) => (
                <div
                  className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
                >
                  <div className="basic500 margin-min">{issuer}</div>
                  {issuerNfts.map(nft => (
                    <NftItem
                      key={nft.id}
                      asset={nft}
                      onClick={assetId => {
                        setAsset(nfts.find(nft => nft.id === assetId));
                        setShowAsset(true);
                      }}
                    />
                  ))}
                </div>
              ))
            )}
          </TabPanel>
          <TabPanel>
            {!history.length && (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyHistory" />
              </div>
            )}
            {history.map(msg => {
              const activeMsg = {
                data: { data: msg, type: msg.type },
                type: 'transaction',
              };
              const conf = getConfigByTransaction(activeMsg);
              const { card: Card } = conf;
              return (
                <Card
                  className="margin-main"
                  key={msg.id}
                  message={activeMsg}
                  assets={assets}
                  collapsed={true}
                />
              );
            })}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal animation={Modal.ANIMATION.FLASH_SCALE} showModal={showCopy}>
        <div className="modal notification">
          <Trans i18nKey="assets.copied" />
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.selected}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.selectAccountNotification" />
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
