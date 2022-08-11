import ObservableStore from 'obs-store';
import { extension } from 'lib/extension';
import {
  CONFIG_URL,
  DEFAULT_CONFIG,
  DEFAULT_FEE_CONFIG,
  DEFAULT_FEE_CONFIG_URL,
  DEFAULT_IDENTITY_CONFIG,
  DEFAULT_IGNORE_ERRORS_CONFIG,
  DEFAULT_NFT_CONFIG,
  DEFAULT_NFT_CONFIG_URL,
  FEE_CONFIG_UPDATE_INTERVAL,
  IDENTITY_CONFIG_UPDATE_INTERVAL,
  IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL,
  IGNORE_ERRORS_CONFIG_URL,
  NFT_CONFIG_UPDATE_INTERVAL,
  STATUS,
} from '../constants';
import { EventEmitter } from 'events';
import * as R from 'ramda';
import ExtensionStore from 'lib/localStore';
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

  constructor({ localStore }: { localStore: ExtensionStore }) {
    super();

    this.store = new ObservableStore(
      localStore.getInitState({
        blacklist: [],
        whitelist: [],
        config: {
          networks: DEFAULT_CONFIG.NETWORKS,
          network_config: DEFAULT_CONFIG.NETWORK_CONFIG,
          messages_config: DEFAULT_CONFIG.MESSAGES_CONFIG,
          pack_config: DEFAULT_CONFIG.PACK_CONFIG,
          idle: DEFAULT_CONFIG.IDLE,
        },
        ignoreErrorsConfig: DEFAULT_IGNORE_ERRORS_CONFIG,
        identityConfig: DEFAULT_IDENTITY_CONFIG,
        feeConfig: DEFAULT_FEE_CONFIG,
        nftConfig: DEFAULT_NFT_CONFIG,
        status: STATUS.PENDING,
      })
    );

    localStore.subscribe(this.store);

    this._getConfig();
    this._getIgnoreErrorsConfig();
    this._fetchIdentityConfig();
    this._fetchFeeConfig();
    this._fetchNftConfig();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extension.alarms.onAlarm.addListener(({ name }: any) => {
      switch (name) {
        case 'updateConfig':
          this._getConfig();
          break;
        case 'updateIgnoreErrorsConfig':
          this._getIgnoreErrorsConfig();
          break;
        case 'fetchIdentityConfig':
          this._fetchIdentityConfig();
          break;
        case 'fetchFeeConfig':
          this._fetchFeeConfig();
          break;
        case 'fetchNftConfig':
          this._fetchNftConfig();
          break;
      }
    });
  }

  getPackConfig() {
    try {
      const { pack_config } = this.store.getState().config;
      return extendValues(DEFAULT_CONFIG.PACK_CONFIG, pack_config);
    } catch (e) {
      return DEFAULT_CONFIG.PACK_CONFIG;
    }
  }

  getIdleConfig() {
    try {
      const { idle } = this.store.getState().config;
      return extendValues(DEFAULT_CONFIG.IDLE, idle);
    } catch (e) {
      return DEFAULT_CONFIG.IDLE;
    }
  }

  getMessagesConfig() {
    try {
      const { messages_config } = this.store.getState().config;
      return extendValues(DEFAULT_CONFIG.MESSAGES_CONFIG, messages_config);
    } catch (e) {
      return DEFAULT_CONFIG.MESSAGES_CONFIG;
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
      return extendValues(DEFAULT_CONFIG.NETWORK_CONFIG, network_config);
    } catch (e) {
      return DEFAULT_CONFIG.NETWORK_CONFIG;
    }
  }

  getNetworks() {
    try {
      const { networks } = this.store.getState().config;
      return networks || DEFAULT_CONFIG.NETWORKS;
    } catch (e) {
      return DEFAULT_CONFIG.NETWORKS;
    }
  }

  updateState(state = {}) {
    const currentState = this.store.getState();
    this.store.updateState({ ...currentState, ...state });
  }

  async _getConfig() {
    try {
      const response = await fetch(CONFIG_URL);

      if (response.ok) {
        const {
          blacklist = [],
          whitelist = [],
          networks = DEFAULT_CONFIG.NETWORKS,
          network_config = DEFAULT_CONFIG.NETWORK_CONFIG,
          messages_config = DEFAULT_CONFIG.MESSAGES_CONFIG,
          idle = DEFAULT_CONFIG.IDLE,
          pack_config = DEFAULT_CONFIG.PACK_CONFIG,
        } = await response.json();

        this.updateState({
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
      this.updateState({ status: STATUS.ERROR });

      throw new Error(`Could not fetch waves_keeper_blacklist.json: ${e}`);
    }

    extension.alarms.create('updateConfig', {
      delayInMinutes: DEFAULT_CONFIG.CONFIG.update_ms / 1000 / 60,
    });
  }

  async _getIgnoreErrorsConfig() {
    const { ignoreErrorsConfig } = this.store.getState();

    try {
      const response = await fetch(IGNORE_ERRORS_CONFIG_URL);

      if (response.ok) {
        this.store.updateState({
          ignoreErrorsConfig: Object.assign(
            {},
            ignoreErrorsConfig,
            await response.json()
          ),
        });
      } else if (response.status < 500) {
        throw new Error(await response.text());
      }
    } catch (err) {
      throw new Error(`Could not fetch keeper-ignore-errors.json: ${err}`);
    } finally {
      extension.alarms.create('updateIgnoreErrorsConfig', {
        delayInMinutes: IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL,
      });
    }
  }

  shouldIgnoreError(context: string, message: string) {
    const { ignoreErrorsConfig } = this.store.getState();

    return (
      ignoreErrorsConfig.ignoreAll ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ignoreErrorsConfig as any)[context].some((str: string) => {
        const re = new RegExp(str);

        return re.test(message);
      })
    );
  }

  async _fetchIdentityConfig() {
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

        if (!R.equals(identityConfig, fetchedConfig)) {
          this.store.updateState({
            identityConfig: Object.assign({}, identityConfig, fetchedConfig),
          });
          this.emit('identityConfigChanged');
        }
      })
      .catch(() => undefined) // ignore
      .then(() =>
        extension.alarms.create('fetchIdentityConfig', {
          delayInMinutes: IDENTITY_CONFIG_UPDATE_INTERVAL,
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

  async _fetchFeeConfig() {
    try {
      const response = await fetch(DEFAULT_FEE_CONFIG_URL);

      if (response.ok) {
        this.store.updateState({ feeConfig: await response.json() });
      } else if (response.status < 500) {
        throw new Error(await response.text());
      }
    } catch (err) {
      throw new Error(`Could not fetch fee.json: ${err}`);
    } finally {
      extension.alarms.create('fetchFeeConfig', {
        delayInMinutes: FEE_CONFIG_UPDATE_INTERVAL,
      });
    }
  }

  async _fetchNftConfig() {
    try {
      const response = await fetch(DEFAULT_NFT_CONFIG_URL);

      if (response.ok) {
        this.store.updateState({ nftConfig: await response.json() });
      } else if (response.status < 500) {
        throw new Error(await response.text());
      }
    } catch (err) {
      throw new Error(`Could not fetch nft.json: ${err}`);
    } finally {
      extension.alarms.create('fetchNftConfig', {
        delayInMinutes: NFT_CONFIG_UPDATE_INTERVAL,
      });
    }
  }

  getFeeConfig() {
    const { feeConfig } = this.store.getState();
    return feeConfig;
  }
}
