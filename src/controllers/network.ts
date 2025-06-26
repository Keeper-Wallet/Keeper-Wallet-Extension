import { addBreadcrumb, setTag } from '@sentry/browser';
import { type TransactionFromNode } from '@waves/ts-types';
import { JSONbn } from '_core/jsonBn';
import { type MessageOrder, type MessageTx } from 'messages/types';
import { stringifyOrder, stringifyTransaction } from 'messages/utils';
import { NetworkName, NetworkProfile } from 'networks/types';
import ObservableStore from 'obs-store';

import { NETWORK_CONFIGS, NETWORKS } from '../networks/config';
import { type ExtensionStorage } from '../storage/storage';

export class NetworkController {
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        currentNetwork: NetworkName.Mainnet,
        currentProfile: NetworkProfile.Mainnet,
        customNodes: {
          [NetworkName.Mainnet]: null,
          [NetworkName.Stagenet]: null,
          [NetworkName.Testnet]: null,
          [NetworkName.Custom]: null,
        },
        customMatchers: {
          [NetworkName.Mainnet]: null,
          [NetworkName.Testnet]: null,
          [NetworkName.Stagenet]: null,
          [NetworkName.Custom]: null,
        },
        customCodes: {
          [NetworkName.Mainnet]: null,
          [NetworkName.Testnet]: null,
          [NetworkName.Stagenet]: null,
          [NetworkName.Custom]: null,
        },
      }),
    );

    extensionStorage.subscribe(this.store);

    setTag('network', this.store.getState().currentNetwork);
  }

  setNetwork(network: NetworkProfile) {
    setTag('network', network);

    addBreadcrumb({
      type: 'user',
      category: 'network-change',
      level: 'info',
      message: `Change network to ${network}`,
    });

    this.store.updateState({ currentNetwork: network });
  }

  setProfile(profile: NetworkProfile) {
    this.store.updateState({ currentProfile: profile });
  }

  setNetworkById(networkId: string) {
    this.store.updateState({ currentNetwork: networkId });
  }

  getNetwork(): NetworkName {
    const currentNetworkId = this.store.getState().currentNetwork;

    if (currentNetworkId === 'mainnet' || currentNetworkId === 'testnet') {
      return currentNetworkId as NetworkName;
    }

    const networkConfig = Object.values(NETWORK_CONFIGS).find(
      config =>
        config &&
        typeof config === 'object' &&
        'id' in config &&
        config.id === currentNetworkId,
    );

    if (networkConfig && 'networkName' in networkConfig) {
      return networkConfig.networkName as NetworkName;
    }

    return NetworkName.Mainnet;
  }

  getCurrentNetworkProfile(): NetworkProfile {
    const currentNetworkId = this.store.getState().currentNetwork;

    // Определяем профиль на основе networkId
    if (
      currentNetworkId === 'custom' ||
      currentNetworkId?.includes('testnet') ||
      currentNetworkId?.includes('stagenet') ||
      currentNetworkId === 'all-testnet'
    ) {
      return NetworkProfile.Testnet;
    }

    return NetworkProfile.Mainnet;
  }

  getProfile() {
    return this.store.getState().currentProfile || NetworkProfile.Mainnet;
  }

  getCurrentNetworkId(): string {
    return this.store.getState().currentNetwork as string;
  }

  setCustomNode(
    url: string | null,
    network: NetworkName = NetworkName.Mainnet,
  ) {
    const { customNodes } = this.store.getState();
    customNodes[network] = url;
    this.store.updateState({ customNodes });
  }

  setCustomMatcher(url: string | null, network: NetworkName) {
    const { customMatchers } = this.store.getState();
    customMatchers[network] = url;
    this.store.updateState({ customMatchers });
  }

  setCustomCode(code: string | null, network: NetworkName) {
    const { customCodes } = this.store.getState();
    customCodes[network] = code;
    this.store.updateState({ customCodes });
  }

  getCustomCodes() {
    return this.store.getState().customCodes;
  }

  getNetworkCode(network?: NetworkName) {
    const profile = network || this.getNetwork();
    const networkConfig = NETWORKS.find(n => n.network === 'waves');
    if (!networkConfig) return '';
    const profileConfig = networkConfig.params[profile as NetworkName];
    if (!profileConfig) return '';
    return profileConfig.chainId;
  }

  getCustomNodes() {
    return this.store.getState().customNodes;
  }

  getNode(network?: NetworkName) {
    network = network || this.getNetwork();
    const networkConfig = NETWORKS.find(n => n.network === 'waves');
    const profileConfig = networkConfig?.params[network as NetworkName];
    return this.getCustomNodes()[network] || profileConfig?.rpcUrl || '';
  }

  getCustomMatchers() {
    return this.store.getState().customMatchers;
  }

  getMatcher() {
    const network = this.getNetwork();
    const customMatcher = this.getCustomMatchers()[network];
    if (customMatcher) return customMatcher;
    const networkConfig = NETWORKS.find(n => n.network === 'waves');
    const profileConfig = networkConfig?.params[network as NetworkName];
    return profileConfig?.matcherUrl || '';
  }

  async getMatcherPublicKey() {
    const response = await fetch(new URL('/matcher', this.getMatcher()));

    if (!response.ok) {
      throw response;
    }

    const matcherPublicKey = (await response.json()) as string;

    return matcherPublicKey;
  }

  async broadcastCancelOrder(
    cancelOrder: {
      orderId: string;
      sender: string;
      signature: string;
    },
    params: {
      amountAsset: string;
      priceAsset: string;
    },
  ) {
    const matcherUrl = this.getMatcher();

    if (!matcherUrl) {
      throw new Error('Matcher not set. Cannot send order');
    }

    const response = await fetch(
      new URL(
        `matcher/orderbook/${params.amountAsset}/${params.priceAsset}/cancel`,
        matcherUrl,
      ),
      {
        method: 'POST',
        headers: {
          accept: 'application/json; large-significand-format=string',
          'content-type': 'application/json; charset=utf-8',
        },
        body: JSONbn.stringify(cancelOrder),
      },
    );

    if (!response.ok) {
      const text = await response.text();

      let errorMessage;
      try {
        errorMessage = JSON.parse(text).message;
      } catch {
        errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    const json = (await response.json()) as unknown;

    return json;
  }

  async broadcastOrder(order: MessageOrder) {
    const matcherUrl = this.getMatcher();

    if (!matcherUrl) {
      throw new Error('Matcher not set. Cannot send order');
    }

    const response = await fetch(new URL('matcher/orderbook', matcherUrl), {
      method: 'POST',
      headers: {
        accept: 'application/json; large-significand-format=string',
        'content-type': 'application/json; charset=utf-8',
      },
      body: stringifyOrder(order),
    });

    if (!response.ok) {
      const text = await response.text();

      let errorMessage;
      try {
        errorMessage = JSON.parse(text).message;
      } catch {
        errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    const json = (await response.json()) as unknown;

    return json;
  }

  async broadcastTransaction(tx: MessageTx) {
    const response = await fetch(
      new URL('transactions/broadcast', this.getNode()),
      {
        method: 'POST',
        headers: {
          accept: 'application/json; large-significand-format=string',
          'content-type': 'application/json; charset=utf-8',
        },
        body: stringifyTransaction(tx),
      },
    );

    if (!response.ok) {
      const text = await response.text();

      let errorMessage;
      try {
        errorMessage = JSON.parse(text).message;
      } catch {
        errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    const json = (await response.json()) as TransactionFromNode;

    return json;
  }
}
