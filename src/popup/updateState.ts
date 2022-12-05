import { deepEqual } from 'fast-equals';

import { AssetsRecord } from '../assets/types';
import { collectBalances } from '../balances/utils';
import { MessageStoreItem } from '../messages/types';
import { NetworkName } from '../networks/types';
import { ACTION } from '../store/actions/constants';
import {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from '../ui/services/Background';
import { PopupStore } from './store/types';

function getParam<S, D>(param: S, defaultParam: D) {
  if (param) {
    return param;
  }

  return param === null ? defaultParam : undefined;
}

type UpdateStateInput = Partial<
  BackgroundGetStateResult & {
    networks: Awaited<ReturnType<BackgroundUiApi['getNetworks']>>;
  }
>;

export function createUpdateState(store: PopupStore) {
  return (state: UpdateStateInput) => {
    const currentState = store.getState();

    if (state.networks && state.networks.length) {
      store.dispatch({
        type: ACTION.UPDATE_NETWORKS,
        payload: state.networks,
      });
    }

    const config = getParam(state.config, {});
    if (config && !deepEqual(currentState.config, config)) {
      store.dispatch({
        type: ACTION.REMOTE_CONFIG.SET_CONFIG,
        payload: config,
      });
    }

    if (
      state.feeConfig &&
      !deepEqual(currentState.feeConfig, state.feeConfig)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_FEE_CONFIG,
        payload: state.feeConfig,
      });
    }

    if (
      state.nftConfig &&
      !deepEqual(currentState.nftConfig, state.nftConfig)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_NFT_CONFIG,
        payload: state.nftConfig,
      });
    }

    const idleOptions = getParam(state.idleOptions, {});
    if (idleOptions && !deepEqual(currentState.idleOptions, idleOptions)) {
      store.dispatch({
        type: ACTION.REMOTE_CONFIG.UPDATE_IDLE,
        payload: idleOptions,
      });
    }

    const customNodes = getParam(state.customNodes, {});
    if (customNodes && !deepEqual(currentState.customNodes, customNodes)) {
      store.dispatch({
        type: ACTION.UPDATE_NODES,
        payload: customNodes,
      });
    }

    const customCodes = getParam(state.customCodes, {});
    if (customCodes && !deepEqual(currentState.customCodes, customCodes)) {
      store.dispatch({
        type: ACTION.UPDATE_CODES,
        payload: customCodes,
      });
    }

    const customMatchers = getParam(state.customMatchers, {});
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
      state.currentLocale &&
      state.currentLocale !== currentState.currentLocale
    ) {
      store.dispatch({
        type: ACTION.UPDATE_FROM_LNG,
        payload: state.currentLocale,
      });
    }

    const uiState = getParam(state.uiState, {});
    if (uiState && !deepEqual(uiState, currentState.uiState)) {
      store.dispatch({
        type: ACTION.UPDATE_UI_STATE,
        payload: uiState,
      });
    }

    const currentNetwork = getParam(state.currentNetwork, '');
    if (currentNetwork && currentNetwork !== currentState.currentNetwork) {
      store.dispatch({
        type: ACTION.UPDATE_CURRENT_NETWORK,
        payload: currentNetwork,
      });
    }

    const origins = getParam(state.origins, {});
    if (origins && !deepEqual(origins, currentState.origins)) {
      store.dispatch({
        type: ACTION.UPDATE_ORIGINS,
        payload: origins,
      });
    }

    function isMyMessages(msg: MessageStoreItem) {
      try {
        const account = state.selectedAccount || currentState.selectedAccount;
        return (
          msg.status === 'unapproved' &&
          msg.account.address === account?.address &&
          msg.account.network === account?.network
        );
      } catch (e) {
        return false;
      }
    }

    const messages = getParam(state.messages, []);
    const unapprovedMessages = messages?.filter(isMyMessages);
    const toUpdateActiveNotify = {
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        payload: { unapprovedMessages, messages: messages! },
      });

      toUpdateActiveNotify.messages = unapprovedMessages;
    }

    const myNotifications = getParam(state.myNotifications, []);
    if (
      myNotifications &&
      !deepEqual(currentState.notifications, myNotifications)
    ) {
      store.dispatch({
        type: ACTION.NOTIFICATIONS.SET,
        payload: myNotifications,
      });

      toUpdateActiveNotify.notifications = myNotifications;
    }

    if (
      messages &&
      (toUpdateActiveNotify.messages !== currentState.messages ||
        toUpdateActiveNotify.notifications !== currentState.notifications)
    ) {
      store.dispatch({
        type: ACTION.MESSAGES.SET_ACTIVE_AUTO,
        payload: toUpdateActiveNotify,
      });
    }

    const selectedAccount = getParam(
      state.selectedAccount,
      {} as unknown as undefined
    );
    if (
      selectedAccount &&
      !deepEqual(selectedAccount, currentState.selectedAccount)
    ) {
      store.dispatch({
        type: ACTION.UPDATE_SELECTED_ACCOUNT,
        payload: selectedAccount,
      });
    }

    const accounts = getParam(state.accounts, []);
    if (accounts && !deepEqual(accounts, currentState.allNetworksAccounts)) {
      store.dispatch({
        type: ACTION.UPDATE_ALL_NETWORKS_ACCOUNTS,
        payload: accounts,
      });
    }

    if (
      (state.accounts != null &&
        !deepEqual(state.accounts, currentState.allNetworksAccounts)) ||
      (state.currentNetwork != null &&
        state.currentNetwork !== currentState.currentNetwork)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const accounts = state.accounts || currentState.allNetworksAccounts;
      const network = state.currentNetwork || currentState.currentNetwork;

      store.dispatch({
        type: ACTION.UPDATE_CURRENT_NETWORK_ACCOUNTS,
        payload: accounts.filter(account => account.network === network),
      });
    }

    if (
      !currentState.state ||
      state.initialized !== currentState.state.initialized ||
      state.locked !== currentState.state.locked
    ) {
      store.dispatch({
        type: ACTION.UPDATE_APP_STATE,
        payload: { initialized: state.initialized, locked: state.locked },
      });
    }

    const balances = collectBalances(state);
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
      BackgroundGetStateResult['assets'] | undefined,
      Partial<Record<NetworkName, AssetsRecord>>
    >(state.assets, {});

    const network = state.currentNetwork || currentState.currentNetwork;
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

    const usdPrices = getParam(state.usdPrices, {});
    if (usdPrices && !deepEqual(usdPrices, currentState.usdPrices)) {
      store.dispatch({
        type: ACTION.SET_USD_PRICES,
        payload: usdPrices,
      });
    }

    const assetLogos = getParam(state.assetLogos, {});
    if (assetLogos && !deepEqual(assetLogos, currentState.assetLogos)) {
      store.dispatch({
        type: ACTION.SET_ASSET_LOGOS,
        payload: assetLogos,
      });
    }

    const assetTickers = getParam(state.assetTickers, {});
    if (assetTickers && !deepEqual(assetTickers, currentState.assetTickers)) {
      store.dispatch({
        type: ACTION.SET_ASSET_TICKERS,
        payload: assetTickers,
      });
    }

    const addresses = getParam(state.addresses, {});
    if (addresses && !deepEqual(addresses, currentState.addresses)) {
      store.dispatch({
        type: ACTION.UPDATE_ADDRESSES,
        payload: addresses,
      });
    }

    const nfts = getParam(state.nfts, null);
    if (nfts && !deepEqual(nfts, currentState.nfts)) {
      store.dispatch({
        type: ACTION.UPDATE_NFTS,
        payload: nfts,
      });
    }
  };
}
