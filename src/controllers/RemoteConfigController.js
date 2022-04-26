import ObservableStore from 'obs-store';
import { extension } from 'lib/extension';
import {
  CONFIG_URL,
  DEFAULT_CONFIG,
  DEFAULT_IDENTITY_CONFIG,
  DEFAULT_IGNORE_ERRORS_CONFIG,
  IDENTITY_CONFIG_UPDATE_INTERVAL,
  IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL,
  IGNORE_ERRORS_CONFIG_URL,
  STATUS,
} from '../constants';
import { EventEmitter } from 'events';
import * as R from 'ramda';

const extendValues = (defaultValues, newValues) => {
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

export class RemoteConfigController extends EventEmitter {
  constructor(options = {}) {
    super();
    const defaults = {
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
      status: STATUS.PENDING,
    };

    this.store = new ObservableStore({ ...defaults, ...options.initState });
    this._getConfig();

    this._getIgnoreErrorsConfig();
    this._fetchIdentityConfig();

    extension.alarms.onAlarm.addListener(({ name }) => {
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

  getNetworkConfig() {
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

  fetchConfig() {
    return fetch(CONFIG_URL)
      .then(resp => resp.text())
      .then(txt => JSON.parse(txt));
  }

  updateState(state = {}) {
    const currentState = this.store.getState();
    this.store.updateState({ ...currentState, ...state });
  }

  async _getConfig() {
    try {
      const {
        blacklist = [],
        whitelist = [],
        networks = DEFAULT_CONFIG.NETWORKS,
        network_config = DEFAULT_CONFIG.NETWORK_CONFIG,
        messages_config = DEFAULT_CONFIG.MESSAGES_CONFIG,
        idle = DEFAULT_CONFIG.IDLE,
        pack_config = DEFAULT_CONFIG.PACK_CONFIG,
      } = await this.fetchConfig();

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
    } catch (e) {
      this.updateState({ status: STATUS.ERROR });
    }

    extension.alarms.create('updateConfig', {
      delayInMinutes: DEFAULT_CONFIG.CONFIG.update_ms / 1000 / 60,
    });
  }

  async _getIgnoreErrorsConfig() {
    const { ignoreErrorsConfig } = this.store.getState();

    try {
      const ignoreErrorsConfigResponse = await fetch(
        IGNORE_ERRORS_CONFIG_URL
      ).then(resp =>
        resp.ok
          ? resp.json()
          : resp.text().then(text => Promise.reject(new Error(text)))
      );

      this.store.updateState({
        ignoreErrorsConfig: Object.assign(
          {},
          ignoreErrorsConfig,
          ignoreErrorsConfigResponse
        ),
      });
    } catch (err) {
      // ignore
    } finally {
      extension.alarms.create('updateIgnoreErrorsConfig', {
        delayInMinutes: IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL,
      });
    }
  }

  shouldIgnoreError(context, message) {
    const { ignoreErrorsConfig } = this.store.getState();

    return (
      ignoreErrorsConfig.ignoreAll ||
      ignoreErrorsConfig[context].some(str => {
        const re = new RegExp(str);

        return re.test(message);
      })
    );
  }

  async _fetchIdentityConfig() {
    const { identityConfig } = this.store.getState();
    const networks = ['mainnet', 'testnet'];

    fetch('https://configs.waves.exchange/web/networks.json')
      .then(resp =>
        resp.ok
          ? resp.json()
          : resp.text().then(text => Promise.reject(new Error(text)))
      )
      .then(wavesNetworks =>
        Promise.all(
          networks.map(async network => {
            const envNetworkConfig = wavesNetworks.find(
              c => c.name === network
            );
            if (!envNetworkConfig) {
              throw new Error(`No network configuration found for ${network}`);
            }

            return fetch(
              `${envNetworkConfig.configService.url}/` +
                `${envNetworkConfig.configService.featuresConfigUrl}`
            ).then(response =>
              response.ok
                ? response.json()
                : response.text().then(text => Promise.reject(new Error(text)))
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

  getIdentityConfig(network) {
    const { identityConfig } = this.store.getState();
    return identityConfig[network === 'testnet' ? 'testnet' : 'mainnet'];
  }
}
