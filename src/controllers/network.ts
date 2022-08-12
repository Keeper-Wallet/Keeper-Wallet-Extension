import * as Sentry from '@sentry/react';
import { ExtensionStore } from '../storage/storage';
import { NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import { RemoteConfigController } from './remoteConfig';

export class NetworkController {
  store;
  private configApi;

  constructor({
    localStore,
    getNetworkConfig,
    getNetworks,
  }: {
    localStore: ExtensionStore;
    getNetworkConfig: RemoteConfigController['getNetworkConfig'];
    getNetworks: RemoteConfigController['getNetworks'];
  }) {
    this.store = new ObservableStore(
      localStore.getInitState({
        currentNetwork: NetworkName.Mainnet,
        customNodes: {
          mainnet: null,
          stagenet: null,
          testnet: null,
          custom: null,
        },
        customMatchers: {
          mainnet: null,
          testnet: null,
          stagenet: null,
          custom: null,
        },
        customCodes: {
          mainnet: null,
          testnet: null,
          stagenet: null,
          custom: null,
        },
      })
    );

    localStore.subscribe(this.store);

    this.configApi = { getNetworkConfig, getNetworks };
    Sentry.setTag('network', this.store.getState().currentNetwork);
  }

  getNetworks() {
    const networks = this.configApi.getNetworkConfig();
    return this.configApi
      .getNetworks()
      .map(name => ({ ...networks[name], name }));
  }

  setNetwork(network: NetworkName) {
    Sentry.setTag('network', network);

    Sentry.addBreadcrumb({
      type: 'user',
      category: 'network-change',
      level: Sentry.Severity.Info,
      message: `Change network to ${network}`,
    });

    this.store.updateState({ currentNetwork: network });
  }

  getNetwork() {
    return this.store.getState().currentNetwork;
  }

  setCustomNode(url: string | null | undefined, network = NetworkName.Mainnet) {
    const { customNodes } = this.store.getState();
    customNodes[network] = url;
    this.store.updateState({ customNodes });
  }

  setCustomMatcher(
    url: string | null | undefined,
    network = NetworkName.Mainnet
  ) {
    const { customMatchers } = this.store.getState();
    customMatchers[network] = url;
    this.store.updateState({ customMatchers });
  }

  setCustomCode(code: string | undefined, network = NetworkName.Mainnet) {
    const { customCodes } = this.store.getState();
    customCodes[network] = code;
    this.store.updateState({ customCodes });
  }

  getCustomCodes() {
    return this.store.getState().customCodes;
  }

  getNetworkCode(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomCodes()[network] || networks[network].code;
  }

  getCustomNodes() {
    return this.store.getState().customNodes;
  }

  getNode(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomNodes()[network] || networks[network].server;
  }

  getCustomMatchers() {
    return this.store.getState().customMatchers;
  }

  getMatcher(network?: NetworkName) {
    network = network || this.getNetwork();
    return (
      this.getCustomMatchers()[network] ||
      this.configApi.getNetworkConfig()[network].matcher
    );
  }

  async getMatcherPublicKey() {
    const keyMap: Record<string, string> = {};
    const url = new URL('/matcher', this.getMatcher()).toString();
    if (keyMap[url] == null) {
      const resp = await fetch(url);

      keyMap[url] = await resp.text();
    }
    return keyMap[url];
  }

  async broadcast(message: {
    amountAsset?: string;
    priceAsset?: string;
    type: string;
    result: string;
  }) {
    const { result, type } = message;
    let API_BASE, url;

    switch (type) {
      case 'transaction':
        API_BASE = this.getNode();
        url = new URL('transactions/broadcast', API_BASE).toString();
        break;
      case 'order':
        API_BASE = this.getMatcher();
        if (!API_BASE) {
          throw new Error('Matcher not set. Cannot send order');
        }
        url = new URL('matcher/orderbook', API_BASE).toString();
        break;
      case 'cancelOrder': {
        const { amountAsset, priceAsset } = message;
        API_BASE = this.getMatcher();
        if (!API_BASE) {
          throw new Error('Matcher not set. Cannot send order');
        }
        url = new URL(
          `matcher/orderbook/${amountAsset}/${priceAsset}/cancel`,
          API_BASE
        ).toString();
        break;
      }
      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: result,
    });

    switch (resp.status) {
      case 200:
        return await resp.text();
      case 400: {
        const error = await resp.json();
        throw new Error(error.message);
      }
      default:
        throw new Error(await resp.text());
    }
  }
}
