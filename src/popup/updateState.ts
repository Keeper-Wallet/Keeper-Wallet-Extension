import { deepEqual } from 'fast-equals';
import { type NotificationsStoreItem } from 'notifications/types';
import type { StorageLocalState } from 'storage/storage';

import { type AssetsRecord } from '../assets/types';
import { collectBalances } from '../balances/utils';
import { type Message, MessageStatus } from '../messages/types';
import { type NetworkName } from '../networks/types';
import { ACTION } from '../store/actions/constants';
import { type PopupStore } from './store/types';

function getParam<S, D>(param: S, defaultParam: D) {
  if (param) {
    return param;
  }

  return param === null ? defaultParam : undefined;
}

type StateChanges = Partial<StorageLocalState>;

export function createUpdateState(store: PopupStore) {
  return (stateChanges: StateChanges) => {
    const currentState = store.getState();

    const config = getParam(stateChanges.config, {});
    if (config && !deepEqual(currentState.config, config)) {
      store.dispatch({
        type: ACTION.REMOTE_CONFIG.SET_CONFIG,
        payload: config,
      });
    }

    if (
      stateChanges.nftConfig &&
      !deepEqual(currentState.nftConfig, stateChanges.nftConfig)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_NFT_CONFIG,
        payload: stateChanges.nftConfig,
      });
    }

    const idleOptions = getParam(stateChanges.idleOptions, {});
    if (idleOptions && !deepEqual(currentState.idleOptions, idleOptions)) {
      store.dispatch({
        type: ACTION.REMOTE_CONFIG.UPDATE_IDLE,
        payload: idleOptions,
      });
    }

    const customNodes = getParam(stateChanges.customNodes, {});
    if (customNodes && !deepEqual(currentState.customNodes, customNodes)) {
      store.dispatch({
        type: ACTION.UPDATE_NODES,
        payload: customNodes,
      });
    }

    const customCodes = getParam(stateChanges.customCodes, {});
    if (customCodes && !deepEqual(currentState.customCodes, customCodes)) {
      store.dispatch({
        type: ACTION.UPDATE_CODES,
        payload: customCodes,
      });
    }

    const customMatchers = getParam(stateChanges.customMatchers, {});
    if (
      customMatchers &&
      !deepEqual(currentState.customMatcher, customMatchers)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_MATCHER,
        payload: customMatchers,
      });
    }

    if (
      stateChanges.currentLocale &&
      stateChanges.currentLocale !== currentState.currentLocale
    ) {
      store.dispatch({
        type: ACTION.UPDATE_FROM_LNG,
        payload: stateChanges.currentLocale,
      });
    }

    const uiState = getParam(stateChanges.uiState, {});
    if (uiState && !deepEqual(uiState, currentState.uiState)) {
      store.dispatch({
        type: ACTION.UPDATE_UI_STATE,
        payload: uiState,
      });
    }

    const currentNetwork = getParam(stateChanges.currentNetwork, '');
    if (currentNetwork && currentNetwork !== currentState.currentNetwork) {
      store.dispatch({
        type: ACTION.UPDATE_CURRENT_NETWORK,
        payload: currentNetwork,
      });
    }

    const origins = getParam(stateChanges.origins, {});
    if (origins && !deepEqual(origins, currentState.origins)) {
      store.dispatch({
        type: ACTION.UPDATE_ORIGINS,
        payload: origins,
      });
    }

    const messages = getParam(stateChanges.messages, []);

    const unapprovedMessages = messages?.filter((msg: Message) => {
      const account =
        stateChanges.selectedAccount || currentState.selectedAccount;

      return (
        account != null &&
        msg.status === MessageStatus.UnApproved &&
        msg.account.address === account.address &&
        msg.account.network === account.network
      );
    });

    const setActiveAutoPayload = {
      allMessages: messages,
      messages: currentState.messages,
      notifications: currentState.notifications,
    };

    if (
      unapprovedMessages &&
      !deepEqual(unapprovedMessages, currentState.messages)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_MESSAGES,
        payload: unapprovedMessages,
      });

      setActiveAutoPayload.messages = unapprovedMessages;
    }

    const currentOrNewSelectedAccount =
      stateChanges.selectedAccount ?? currentState.selectedAccount;

    const myNotifications =
      currentOrNewSelectedAccount &&
      stateChanges.notifications &&
      stateChanges.notifications
        .filter(
          notification =>
            notification.address === currentOrNewSelectedAccount.address,
        )
        .reverse()
        .reduce<{
          items: NotificationsStoreItem[][];
          hash: Record<string, NotificationsStoreItem[]>;
        }>(
          (acc, item) => {
            if (!acc.hash[item.origin]) {
              acc.hash[item.origin] = [];
              acc.items.push(acc.hash[item.origin]);
            }

            acc.hash[item.origin].push(item);

            return acc;
          },
          { items: [], hash: {} },
        ).items;

    if (
      myNotifications &&
      !deepEqual(currentState.notifications, myNotifications)
    ) {
      store.dispatch({
        type: ACTION.NOTIFICATIONS.SET,
        payload: myNotifications,
      });

      setActiveAutoPayload.notifications = myNotifications;
    }

    if (
      messages &&
      (setActiveAutoPayload.messages !== currentState.messages ||
        setActiveAutoPayload.notifications !== currentState.notifications)
    ) {
      store.dispatch({
        type: ACTION.MESSAGES.SET_ACTIVE_AUTO,
        payload: setActiveAutoPayload,
      });
    }

    const newSelectedAccount = getParam(
      stateChanges.selectedAccount,
      {} as unknown as undefined,
    );
    if (
      newSelectedAccount &&
      !deepEqual(newSelectedAccount, currentState.selectedAccount)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_SELECTED_ACCOUNT,
        payload: newSelectedAccount,
      });
    }

    const accounts = getParam(stateChanges.accounts, []);
    if (accounts && !deepEqual(accounts, currentState.allNetworksAccounts)) {
      store.dispatch({
        type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
        payload: accounts,
      });
    }

    if (
      (stateChanges.accounts != null &&
        !deepEqual(stateChanges.accounts, currentState.allNetworksAccounts)) ||
      (stateChanges.currentNetwork != null &&
        stateChanges.currentNetwork !== currentState.currentNetwork)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const accounts =
        stateChanges.accounts || currentState.allNetworksAccounts;
      const network =
        stateChanges.currentNetwork || currentState.currentNetwork;

      store.dispatch({
        type: ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS,
        payload: accounts.filter(account => account.network === network),
      });
    }

    if (
      !currentState.state ||
      ('initialized' in stateChanges &&
        stateChanges.initialized !== currentState.state.initialized) ||
      ('locked' in stateChanges &&
        stateChanges.locked !== currentState.state.locked)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_APP_STATE,
        payload: {
          initialized:
            stateChanges.initialized ?? currentState.state?.initialized,
          locked: stateChanges.locked ?? currentState.state?.locked,
        },
      });
    }

    const balances = collectBalances(stateChanges);
    if (Object.keys(balances).length !== 0) {
      store.dispatch({
        type: ACTION.UPDATE_BALANCES,
        payload: {
          ...currentState.balances,
          ...balances,
        },
      });
    }

    const assets = getParam<
      StorageLocalState['assets'] | undefined,
      Partial<Record<NetworkName, AssetsRecord>>
    >(stateChanges.assets, {});

    const network = stateChanges.currentNetwork || currentState.currentNetwork;
    if (
      assets &&
      assets[network] &&
      !deepEqual(assets[network], currentState.assets)
    ) {
      store.dispatch({
        type: ACTION.SET_ASSETS,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        payload: assets[network]!,
      });
    }

    const swappableAssetIdsByVendor = getParam(
      stateChanges.swappableAssetIdsByVendor,
      {},
    );
    if (
      swappableAssetIdsByVendor &&
      !deepEqual(
        currentState.swappableAssetIdsByVendor,
        swappableAssetIdsByVendor,
      )
    ) {
      store.dispatch({
        type: ACTION.UPDATE_SWAPPABLE_ASSETS,
        payload: swappableAssetIdsByVendor,
      });
    }

    const usdPrices = getParam(stateChanges.usdPrices, {});
    if (usdPrices && !deepEqual(usdPrices, currentState.usdPrices)) {
      store.dispatch({
        type: ACTION.SET_USD_PRICES,
        payload: usdPrices,
      });
    }

    const assetLogos = getParam(stateChanges.assetLogos, {});
    if (assetLogos && !deepEqual(assetLogos, currentState.assetLogos)) {
      store.dispatch({
        type: ACTION.SET_ASSET_LOGOS,
        payload: assetLogos,
      });
    }

    const assetTickers = getParam(stateChanges.assetTickers, {});
    if (assetTickers && !deepEqual(assetTickers, currentState.assetTickers)) {
      store.dispatch({
        type: ACTION.SET_ASSET_TICKERS,
        payload: assetTickers,
      });
    }

    const addresses = getParam(stateChanges.addresses, {});
    if (addresses && !deepEqual(addresses, currentState.addresses)) {
      store.dispatch({
        type: ACTION.UPDATE_ADDRESSES,
        payload: addresses,
      });
    }

    const nfts = getParam(stateChanges.nfts, null);
    if (nfts && !deepEqual(nfts, currentState.nfts)) {
      store.dispatch({
        type: ACTION.UPDATE_NFTS,
        payload: nfts,
      });
    }
  };
}
