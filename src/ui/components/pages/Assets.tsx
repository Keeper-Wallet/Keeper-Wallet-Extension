import * as styles from './styles/assets.styl';
import cn from 'classnames';
import * as React from 'react';
import { useState } from 'react';
import { ActiveAccountCard } from '../accounts/activeAccountCard';
import { Trans, useTranslation } from 'react-i18next';
import {
  getAliases,
  getAsset,
  getBalances,
  getNfts,
  getTxHistory,
  setActiveAccount,
  setUiState,
} from '../../actions';
import { PAGES } from '../../pageConfig';
import { Asset, Money } from '@waves/data-entities';
import {
  Button,
  Input,
  Modal,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '../ui';
import { Intro } from './Intro';
import { FeatureUpdateInfo } from './FeatureUpdateInfo';
import { useAppDispatch, useAppSelector } from 'ui/store';
import { BigNumber } from '@waves/bignumber';
import { AssetItem } from './assets/assetItem';
import { NftItem } from './assets/nftItem';
import { AssetInfo } from './assets/assetInfo';
import { HistoryItem } from './assets/historyItem';
import {
  ITransaction,
  WithId,
} from '@waves/waves-transactions/dist/transactions';

const MONTH = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function SearchInput({ value, onInput }) {
  return (
    <div className="flex grow">
      <Input className={styles.searchInput} onInput={onInput} value={value} />
    </div>
  );
}

interface Props {
  setTab: (newTab: string) => void;
}

export function Assets({ setTab }: Props) {
  const colorBasic500 = '#9BA6B2';
  const colorSubmit = '#1F5AF6';

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const activeAccount = useAppSelector(state =>
    state.accounts.find(
      ({ address }) => address === state.selectedAccount.address
    )
  );
  const assets = useAppSelector(state => state.assets);
  const balances = useAppSelector(state => state.balances);
  const txHistory = useAppSelector(state => state.txHistory);
  const nfts = useAppSelector(state => state.nfts);
  const notifications = useAppSelector(state => state.localState.notifications);
  const showUpdateInfo = useAppSelector(
    state => !state.uiState.isFeatureUpdateShown && !!state.accounts.length
  );

  const [asset, setAsset] = useState(null);
  const [showAsset, setShowAsset] = useState(false);
  const [showCopy, setShowCopy] = React.useState(false);
  const [assetTerm, setAssetTerm] = useState(null);
  const [nftTerm, setNftTerm] = useState(null);
  const [txHistoryTerm, setTxHistoryTerm] = useState(null);
  const [onlyMyAssets, setOnlyMyAssets] = useState(false);
  const [onlyMyNfts, setOnlyMyNfts] = useState(false);
  const [showTxHistoryFilters, setShowTxHistoryFilters] = useState(false);

  React.useEffect(() => {
    if (!assets['WAVES']) {
      dispatch(getAsset('WAVES'));
    }
  }, [assets, dispatch]);

  const address = activeAccount && activeAccount.address;

  React.useEffect(() => {
    if (address) {
      dispatch(getNfts(address));
      dispatch(getTxHistory(address));
      dispatch(getAliases(address));
    }
    dispatch(getBalances());
  }, []);

  const onSelectHandler = account => {
    dispatch(setActiveAccount(account));
    setTab(PAGES.ACCOUNT_INFO);
  };

  if (!activeAccount) {
    return <Intro />;
  }

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
    balances[address]?.assets || {}
  );

  const thisYear = new Date().getFullYear();
  const historyEntries = Object.entries<Array<ITransaction & WithId>>(
    txHistory.reduce((result, tx) => {
      const d = new Date(tx.timestamp);
      const [year, month, day] = [d.getFullYear(), d.getMonth(), d.getDate()];
      const date = `${(year !== thisYear && year) || ''} ${t(
        `date.${MONTH[month]}`
      )} ${day}`;
      return {
        ...result,
        [date]: [...(result[date] || []), tx],
      };
    }, {})
  );

  return (
    <div className={styles.assets}>
      <div className={styles.activeAccount}>
        <ActiveAccountCard
          account={activeAccount}
          balance={balancesMoney[address]}
          onCopy={() => {
            setShowCopy(true);
            setTimeout(() => setShowCopy(false), 1000);
          }}
          onOtherAccountsClick={() => {
            setTab(PAGES.OTHER_ACCOUNTS);
          }}
          onClick={onSelectHandler}
          onSendClick={() => {
            setTab(PAGES.SEND);
          }}
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
            <div className="flex margin1">
              <SearchInput
                value={assetTerm}
                onInput={e => setAssetTerm(e.value.text)}
              />
              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setOnlyMyAssets(!onlyMyAssets)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill={onlyMyAssets ? colorSubmit : colorBasic500}
                    fillOpacity=".01"
                    d="M0 0h14v14H0z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                    fill={onlyMyAssets ? colorSubmit : colorBasic500}
                  />
                </svg>
              </div>
              <div className={cn(styles.filterTooltip, 'tooltip')}>
                <Trans i18nKey="Only my assets" />
              </div>
            </div>

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
            <div className="flex grow margin1">
              <SearchInput
                value={nftTerm}
                onInput={e => setNftTerm(e.value.text)}
              />
              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setOnlyMyNfts(!onlyMyNfts)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill={onlyMyNfts ? colorSubmit : colorBasic500}
                    fillOpacity=".01"
                    d="M0 0h14v14H0z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 5.6c1.534 0 2.778-1.254 2.778-2.8C9.778 1.254 8.534 0 7 0S4.222 1.254 4.222 2.8c0 1.546 1.244 2.8 2.778 2.8Zm-5 6.16c.003-2.782 2.24-5.037 5-5.04 2.76.003 4.997 2.258 5 5.04v1.68c0 .31-.249.56-.556.56H2.556A.558.558 0 0 1 2 13.44v-1.68Z"
                    fill={onlyMyNfts ? colorSubmit : colorBasic500}
                  />
                </svg>
              </div>
              <div className={cn(styles.filterTooltip, 'tooltip')}>
                <Trans i18nKey="Only my NFTs" />
              </div>
            </div>
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
                  key={issuer}
                  className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
                >
                  <div className="basic500 margin-min">
                    <Trans i18nKey="assets.issuedBy" values={{ issuer }} />
                  </div>
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
            <div className="flex grow margin1">
              <SearchInput
                value={txHistoryTerm}
                onInput={e => setTxHistoryTerm(e.value.text)}
              />
              <div
                className={cn('showTooltip', styles.filterBtn)}
                onClick={() => setShowTxHistoryFilters(!showTxHistoryFilters)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.186163 1.40875C1.9633 3.675 5.24485 7.875 5.24485 7.875V13.125C5.24485 13.6063 5.64075 14 6.12463 14H7.88417C8.36805 14 8.76394 13.6063 8.76394 13.125V7.875C8.76394 7.875 12.0367 3.675 13.8138 1.40875C14.2625 0.83125 13.849 0 13.1188 0H0.881183C0.150972 0 -0.262521 0.83125 0.186163 1.40875Z"
                    fill={showTxHistoryFilters ? colorSubmit : colorBasic500}
                  />
                </svg>
              </div>
              <div className={cn(styles.filterTooltip, 'tooltip')}>
                <Trans i18nKey="Apply filters" />
              </div>
            </div>
            {!historyEntries.length ? (
              <div className="basic500 center margin-min-top">
                <Trans i18nKey="assets.emptyHistory" />
              </div>
            ) : (
              historyEntries.map(([date, txArr], index) => (
                <div
                  key={date}
                  className={index === 0 ? 'margin-min-top' : 'margin-main-top'}
                >
                  <div className="basic500 margin-min">{date}</div>
                  {txArr.map(tx => (
                    <HistoryItem key={tx.id} tx={tx} />
                  ))}
                </div>
              ))
            )}
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
        showModal={notifications.accountCreationSuccess}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.accountCreationSuccessNotification" />
          </div>
        </div>
      </Modal>

      <Modal
        animation={Modal.ANIMATION.FLASH_SCALE}
        showModal={notifications.accountImportSuccess}
      >
        <div className="modal notification">
          <div>
            <Trans i18nKey="assets.accountImportSuccessNotification" />
          </div>
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

      <Modal animation={Modal.ANIMATION.FLASH} showModal={showTxHistoryFilters}>
        <div className="modal cover">
          <form
            className="modal-form"
            onSubmit={e => {
              e.preventDefault();
              setShowTxHistoryFilters(false);
            }}
          >
            <Button type="submit">
              <Trans i18nKey="Apply" />
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
