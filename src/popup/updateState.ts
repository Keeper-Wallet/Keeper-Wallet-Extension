import { deepEqual } from 'fast-equals';
import { type NotificationsStoreItem } from 'notifications/types';
import type { StorageLocalState } from 'storage/storage';

import { type AssetsRecord } from '../assets/types';
import { collectBalances } from '../balances/utils';
import { type Message, MessageStatus } from '../messages/types';
import { type NetworkName } from '../networks/types';
import { ACTION } from '../store/actions/constants';
import { type PopupStore } from './store/types';
import Background from '../ui/services/Background';
import { PreferencesAccount } from '../preferences/types';

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
    const currentBlockchainType = getParam(
      stateChanges.currentBlockchainType,
      '',
    );
    if (
      currentBlockchainType &&
      currentBlockchainType !== currentState.currentBlockchainType
    ) {
      store.dispatch({
        type: ACTION.UPDATE_CURRENT_BLOCKCHAIN_TYPE,
        payload: currentBlockchainType,
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
        payload: accounts as unknown as PreferencesAccount[],
      });
    }

    if (
      (stateChanges.accounts !== null &&
        !deepEqual(stateChanges.accounts, currentState.allNetworksAccounts)) ||
      (stateChanges.currentNetwork !== null &&
        stateChanges.currentNetwork !== currentState.currentNetwork) ||
      (stateChanges.currentBlockchainType !== null &&
        stateChanges.currentBlockchainType !==
          currentState.currentBlockchainType)
    ) {
      // Get legacy format accounts from background
      // This gets accounts in the old format that components expect
      Background.getLegacyFormatAccounts().then(legacyAccounts => {
        // Get full MultiWallet data to enrich legacy accounts
        Background.getMultiWallets()
          .then(multiWallets => {
            // Enrich legacy accounts with MultiWallet data
            const enrichedAccounts = legacyAccounts.map(account => {
              // Check if this is a multichain wallet
              if (account.type === 'multichain') {
                // Find the corresponding MultiWallet
                const multiWallet = multiWallets.find(
                  mw => mw.id === account.id,
                );
                if (multiWallet) {
                  // Return the account with additional MultiWallet data
                  return {
                    ...account,
                    // Add the coins data for accessing network-specific info
                    coins: multiWallet.coins,
                  };
                }
              }
              return account;
            });

            store.dispatch({
              type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
              payload: enrichedAccounts as unknown as PreferencesAccount[],
            });

            store.dispatch({
              type: ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS,
              payload: enrichedAccounts.filter(
                account => account.network === network,
              ) as unknown as PreferencesAccount[],
            });
          })
          .catch(error => {
            console.error('Error fetching MultiWallet data:', error);
            // Fallback to just using legacy accounts without enrichment
            store.dispatch({
              type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
              payload: legacyAccounts as unknown as PreferencesAccount[],
            });

            store.dispatch({
              type: ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS,
              payload: legacyAccounts.filter(
                account => account.network === network,
              ) as unknown as PreferencesAccount[],
            });
          });
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
