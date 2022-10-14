import ObservableStore from 'obs-store';
import * as browser from 'webextension-polyfill';
import {
  DEFAULT_LEGACY_CONFIG,
  DEFAULT_MAIN_CONFIG,
  DEFAULT_IDENTITY_CONFIG,
  STATUS,
  MainConfig,
  IgnoreErrorsContext,
} from '../constants';
import { EventEmitter } from 'events';
import { equals } from 'ramda';
import { ExtensionStorage } from '../storage/storage';
import { IdentityConfig } from './IdentityController';
import { NetworkName } from 'networks/types';

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
    { ...newValues }
  );
};

interface NetworkConfigItem {
  code: string;
  server: string;
  matcher: string;
}

type NetworkConfig = Record<string, NetworkConfigItem>;

export class RemoteConfigController extends EventEmitter {
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        blacklist: [],
        whitelist: [],
        config: {
          networks: DEFAULT_LEGACY_CONFIG.NETWORKS,
          network_config: DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG,
          messages_config: DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG,
          pack_config: DEFAULT_LEGACY_CONFIG.PACK_CONFIG,
          idle: DEFAULT_LEGACY_CONFIG.IDLE,
        },
        assetsConfig: DEFAULT_MAIN_CONFIG.assets,
        ignoreErrorsConfig: DEFAULT_MAIN_CONFIG.ignoreErrors,
        identityConfig: DEFAULT_IDENTITY_CONFIG,
        feeConfig: DEFAULT_MAIN_CONFIG.fee,
        nftConfig: DEFAULT_MAIN_CONFIG.nfts,
        status: STATUS.PENDING,
      })
    );

    extensionStorage.subscribe(this.store);

    this.#updateLegacyConfig();
    this.#updateMainConfig();
    this.#updateIdentityConfig();

    browser.alarms.onAlarm.addListener(({ name }) => {
      switch (name) {
        case 'updateLegacyConfig':
          this.#updateLegacyConfig();
          break;
        case 'updateMainConfig':
          this.#updateMainConfig();
          break;
        case 'updateIdentityConfig':
          this.#updateIdentityConfig();
          break;
      }
    });
  }

  getPackConfig(): typeof DEFAULT_LEGACY_CONFIG.PACK_CONFIG {
    try {
      const { pack_config } = this.store.getState().config;
      return extendValues(DEFAULT_LEGACY_CONFIG.PACK_CONFIG, pack_config);
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.PACK_CONFIG;
    }
  }

  getIdleConfig() {
    try {
      const { idle } = this.store.getState().config;
      return extendValues(DEFAULT_LEGACY_CONFIG.IDLE, idle);
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.IDLE;
    }
  }

  getMessagesConfig() {
    try {
      const { messages_config } = this.store.getState().config;
      return extendValues(
        DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG,
        messages_config
      );
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG;
    }
  }

  getBlacklist() {
    try {
      const { blacklist } = this.store.getState();

      if (Array.isArray(blacklist)) {
        return blacklist.filter(item => typeof item === 'string');
      }

      return [];
    } catch (e) {
      return [];
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

  getNetworkConfig(): NetworkConfig {
    try {
      const { network_config } = this.store.getState().config;
      return extendValues(DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG, network_config);
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG;
    }
  }

  getNetworks() {
    try {
      const { networks } = this.store.getState().config;
      return networks || DEFAULT_LEGACY_CONFIG.NETWORKS;
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.NETWORKS;
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

  getFeeConfig() {
    const { feeConfig } = this.store.getState();
    return feeConfig;
  }

  getAssetsConfig() {
    const { assetsConfig } = this.store.getState();
    return assetsConfig;
  }

  async #updateLegacyConfig() {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/wavesplatform/waves-client-config/master/waves_keeper_blacklist.json'
      );

      if (response.ok) {
        const {
          blacklist = [],
          whitelist = [],
          networks = DEFAULT_LEGACY_CONFIG.NETWORKS,
          network_config = DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG,
          messages_config = DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG,
          idle = DEFAULT_LEGACY_CONFIG.IDLE,
          pack_config = DEFAULT_LEGACY_CONFIG.PACK_CONFIG,
        } = await response.json();

        this.store.updateState({
          blacklist,
          whitelist,
          config: {
            idle,
            networks,
            network_config,
            messages_config,
            pack_config,
          },
          status: STATUS.UPDATED,
        });
      } else if (response.status < 500) {
        throw new Error(await response.text());
      }
    } catch (e) {
      this.store.updateState({ status: STATUS.ERROR });

      // ignore sentry errors
    }

    browser.alarms.create('updateLegacyConfig', {
      delayInMinutes: DEFAULT_LEGACY_CONFIG.CONFIG.update_ms / 1000 / 60,
    });
  }

  async #updateMainConfig() {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Keeper-Wallet/configs/master/main.json'
      );

      if (response.ok) {
        const config: MainConfig = await response.json();
        const { ignoreErrorsConfig } = this.store.getState();

        this.store.updateState({
          assetsConfig: config.assets,
          feeConfig: config.fee,
          ignoreErrorsConfig: { ...ignoreErrorsConfig, ...config.ignoreErrors },
          nftConfig: config.nfts,
        });
      }
    } catch {
      // ignore errors
    }

    browser.alarms.create('updateMainConfig', { delayInMinutes: 1 });
  }

  async #updateIdentityConfig() {
    const { identityConfig } = this.store.getState();
    const networks = [NetworkName.Mainnet, NetworkName.Testnet];

    fetch('https://configs.waves.exchange/web/networks.json')
      .then(resp =>
        resp.ok
          ? resp.json()
          : resp.text().then(text => Promise.reject(new Error(text)))
      )
      .then(
        (
          wavesNetworks: Array<{
            configService: { url: string; featuresConfigUrl: string };
            name: string;
          }>
        ) =>
          Promise.all(
            networks.map(async network => {
              const envNetworkConfig = wavesNetworks.find(
                c => c.name === network
              );
              if (!envNetworkConfig) {
                throw new Error(
                  `No network configuration found for ${network}`
                );
              }

              return fetch(
                `${envNetworkConfig.configService.url}/` +
                  `${envNetworkConfig.configService.featuresConfigUrl}`
              ).then(response =>
                response.ok
                  ? response.json()
                  : response
                      .text()
                      .then(text => Promise.reject(new Error(text)))
              );
            })
          )
      )
      .then(networkConfigs => {
        const fetchedConfig = Object.fromEntries(
          networks.map((network, i) => [network, networkConfigs[i].identity])
        );

        if (!equals(identityConfig, fetchedConfig)) {
          this.store.updateState({
            identityConfig: Object.assign({}, identityConfig, fetchedConfig),
          });
          this.emit('identityConfigChanged');
        }
      })
      .catch(() => undefined) // ignore
      .then(() =>
        browser.alarms.create('updateIdentityConfig', { delayInMinutes: 1 })
      );
  }
}
