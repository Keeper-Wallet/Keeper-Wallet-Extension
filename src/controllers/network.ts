import { JSONbn } from '_core/jsonBn';
import { addBreadcrumb, setTag } from '@sentry/browser';
import { type TransactionFromNode } from '@waves/ts-types';
import { type MessageOrder, type MessageTx } from 'messages/types';
import { stringifyOrder, stringifyTransaction } from 'messages/utils';
import { NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';

import { NETWORK_CONFIG } from '../constants';
import { type ExtensionStorage } from '../storage/storage';

export class NetworkController {
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
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
      }),
    );

    extensionStorage.subscribe(this.store);

    setTag('network', this.store.getState().currentNetwork);
  }

  setNetwork(network: NetworkName) {
    setTag('network', network);

    addBreadcrumb({
      type: 'user',
      category: 'network-change',
      level: 'info',
      message: `Change network to ${network}`,
    });

    this.store.updateState({ currentNetwork: network });
  }

  getNetwork() {
    return this.store.getState().currentNetwork;
  }

  setCustomNode(url: string | null, network = NetworkName.Mainnet) {
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
    network = network || this.getNetwork();

    return (
      this.getCustomCodes()[network] || NETWORK_CONFIG[network].networkCode
    );
  }

  getCustomNodes() {
    return this.store.getState().customNodes;
  }

  getNode(network?: NetworkName) {
    network = network || this.getNetwork();

    return (
      this.getCustomNodes()[network] || NETWORK_CONFIG[network].nodeBaseUrl
    );
  }

  getCustomMatchers() {
    return this.store.getState().customMatchers;
  }

  getMatcher() {
    return (
      this.getCustomMatchers()[this.getNetwork()] ||
      NETWORK_CONFIG[this.getNetwork()].matcherBaseUrl
    );
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
