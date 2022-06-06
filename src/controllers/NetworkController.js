import * as Sentry from '@sentry/react';
import ObservableStore from 'obs-store';

export class NetworkController {
  constructor({ localStore, getNetworkConfig, getNetworks }) {
    const defaults = {
      currentNetwork: 'mainnet',
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
    };
    this.store = new ObservableStore(localStore.getInitState(defaults));
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

  setNetwork(network) {
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

  setCustomNode(url, network = 'mainnet') {
    const { customNodes } = this.store.getState();
    customNodes[network] = url;
    this.store.updateState({ customNodes });
  }

  setCustomMatcher(url, network = 'mainnet') {
    const { customMatchers } = this.store.getState();
    customMatchers[network] = url;
    this.store.updateState({ customMatchers });
  }

  setCustomCode(code, network = 'mainnet') {
    const { customCodes } = this.store.getState();
    customCodes[network] = code;
    this.store.updateState({ customCodes });
  }

  getCustomCodes() {
    return this.store.getState().customCodes;
  }

  getNetworkCode(network) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomCodes()[network] || networks[network].code;
  }

  getCustomNodes() {
    return this.store.getState().customNodes;
  }

  getNode(network) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomNodes()[network] || networks[network].server;
  }

  getCustomMatchers() {
    return this.store.getState().customMatchers;
  }

  getMatcher(network) {
    network = network || this.getNetwork();
    return (
      this.getCustomMatchers()[network] ||
      this.configApi.getNetworkConfig()[network].matcher
    );
  }

  async getMatcherPublicKey() {
    const keyMap = {};
    const url = new URL('/matcher', this.getMatcher()).toString();
    if (keyMap[url] == null) {
      const resp = await fetch(url);

      keyMap[url] = await resp.text();
    }
    return keyMap[url];
  }

  async broadcast(message) {
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
