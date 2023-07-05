import { EventEmitter } from 'events';
import { deepEqual } from 'fast-equals';
import { NetworkName } from 'networks/types';
import ObservableStore from 'obs-store';
import Browser from 'webextension-polyfill';

import {
  DEFAULT_IDENTITY_CONFIG,
  DEFAULT_MAIN_CONFIG,
  type IgnoreErrorsContext,
  type MainConfig,
  STATUS,
} from '../constants';
import { type ExtensionStorage } from '../storage/storage';
import { type IdentityConfig } from './IdentityController';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extendValues = (defaultValues: any, newValues: any) => {
  return Object.entries(defaultValues).reduce(
    (acc, [key, value]) => {
      try {
        switch (typeof value) {
          case 'number':
            acc[key] = Number(acc[key]) ? acc[key] : value;
            break;
          case 'string':
            acc[key] = typeof acc[key] === 'string' ? acc[key] : value;
            break;
          case 'object':
            acc[key] = Array.isArray(value)
              ? [...value, ...(acc[key] || [])]
              : { ...value, ...acc[key] };
            break;
        }
      } catch (e) {
        acc[key] = value;
      }
      return acc;
    },
    { ...newValues },
  );
};

export class RemoteConfigController extends EventEmitter {
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        whitelist: DEFAULT_MAIN_CONFIG.whitelist,
        config: {
          messages_config: DEFAULT_MAIN_CONFIG.messages_config,
          pack_config: DEFAULT_MAIN_CONFIG.pack_config,
          idle: DEFAULT_MAIN_CONFIG.idle,
        },
        assetsConfig: DEFAULT_MAIN_CONFIG.assets,
        ignoreErrorsConfig: DEFAULT_MAIN_CONFIG.ignoreErrors,
        identityConfig: DEFAULT_IDENTITY_CONFIG,
        nftConfig: DEFAULT_MAIN_CONFIG.nfts,
        status: STATUS.PENDING,
      }),
    );

    extensionStorage.subscribe(this.store);

    this.#updateMainConfig();
    this.#updateIdentityConfig();

    Browser.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'updateMainConfig':
          this.#updateMainConfig();
          break;
        case 'updateIdentityConfig':
          this.#updateIdentityConfig();
          break;
      }
    });
  }

  getPackConfig(): typeof DEFAULT_MAIN_CONFIG.pack_config {
    try {
      const { pack_config } = this.store.getState().config;
      return extendValues(DEFAULT_MAIN_CONFIG.pack_config, pack_config);
    } catch (e) {
      return DEFAULT_MAIN_CONFIG.pack_config;
    }
  }

  getIdleConfig() {
    try {
      const { idle } = this.store.getState().config;
      return extendValues(DEFAULT_MAIN_CONFIG.idle, idle);
    } catch (e) {
      return DEFAULT_MAIN_CONFIG.idle;
    }
  }

  getMessagesConfig() {
    try {
      const { messages_config } = this.store.getState().config;
      return extendValues(DEFAULT_MAIN_CONFIG.messages_config, messages_config);
    } catch (e) {
      return DEFAULT_MAIN_CONFIG.messages_config;
    }
  }

  getWhitelist() {
    try {
      const { whitelist } = this.store.getState();

      if (Array.isArray(whitelist)) {
        return whitelist.filter(item => typeof item === 'string');
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  shouldIgnoreError(context: IgnoreErrorsContext, message: string) {
    const { ignoreErrorsConfig } = this.store.getState();

    return (
      ignoreErrorsConfig.ignoreAll ||
      ignoreErrorsConfig[context].some(str => {
        const re = new RegExp(str);

        return re.test(message);
      })
    );
  }

  getIdentityConfig(network: NetworkName): IdentityConfig {
    const { identityConfig } = this.store.getState();

    return identityConfig[
      network === NetworkName.Testnet
        ? NetworkName.Testnet
        : NetworkName.Mainnet
    ];
  }

  getAssetsConfig() {
    const { assetsConfig } = this.store.getState();
    return assetsConfig;
  }

  async #updateMainConfig() {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Keeper-Wallet/configs/master/main.json',
      );

      if (response.ok) {
        const config: MainConfig = await response.json();
        const { ignoreErrorsConfig } = this.store.getState();

        this.store.updateState({
          assetsConfig: config.assets,
          ignoreErrorsConfig: { ...ignoreErrorsConfig, ...config.ignoreErrors },
          nftConfig: config.nfts,
        });
      }
    } catch {
      // ignore errors
    }

    Browser.alarms.create('updateMainConfig', { delayInMinutes: 1 });
  }

  async #updateIdentityConfig() {
    const { identityConfig } = this.store.getState();
    const networks = [NetworkName.Mainnet, NetworkName.Testnet];

    fetch('https://configs.waves.exchange/web/networks.json')
      .then(resp =>
        resp.ok
          ? resp.json()
          : resp.text().then(text => Promise.reject(new Error(text))),
      )
      .then(
        (
          wavesNetworks: Array<{
            configService: { url: string; featuresConfigUrl: string };
            name: string;
          }>,
        ) =>
          Promise.all(
            networks.map(async network => {
              const envNetworkConfig = wavesNetworks.find(
                c => c.name === network,
              );
              if (!envNetworkConfig) {
                throw new Error(
                  `No network configuration found for ${network}`,
                );
              }

              return fetch(
                `${envNetworkConfig.configService.url}/` +
                  `${envNetworkConfig.configService.featuresConfigUrl}`,
              ).then(response =>
                response.ok
                  ? response.json()
                  : response
                      .text()
                      .then(text => Promise.reject(new Error(text))),
              );
            }),
          ),
      )
      .then(networkConfigs => {
        const fetchedConfig = Object.fromEntries(
          networks.map((network, i) => [network, networkConfigs[i].identity]),
        );

        if (!deepEqual(identityConfig, fetchedConfig)) {
          this.store.updateState({
            identityConfig: Object.assign({}, identityConfig, fetchedConfig),
          });
          this.emit('identityConfigChanged');
        }
      })
      .catch(() => undefined) // ignore
      .then(() =>
        Browser.alarms.create('updateIdentityConfig', { delayInMinutes: 1 }),
      );
  }
}
