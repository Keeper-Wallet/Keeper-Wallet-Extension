import ObservableStore from 'obs-store';
import {
  CONFIG_URL,
  DEFAULT_CONFIG,
  DEFAULT_IGNORE_ERRORS_CONFIG,
  IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL,
  IGNORE_ERRORS_CONFIG_URL,
  STATUS,
} from '../constants';

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

export class RemoteConfigController {
  constructor(options = {}) {
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
      status: STATUS.PENDING,
    };

    this.store = new ObservableStore({ ...defaults, ...options.initState });
    this._getConfig();

    this._ignoreErrorsConfig = DEFAULT_IGNORE_ERRORS_CONFIG;
    this._getIgnoreErrorsConfig();
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

    clearTimeout(this._timer);

    this._timer = setTimeout(
      () => this._getConfig(),
      DEFAULT_CONFIG.CONFIG.update_ms
    );
  }

  async _getIgnoreErrorsConfig() {
    try {
      const ignoreErrorsConfig = await fetch(IGNORE_ERRORS_CONFIG_URL).then(
        resp =>
          resp.ok
            ? resp.json()
            : resp.text().then(text => Promise.reject(new Error(text)))
      );

      Object.assign(this._ignoreErrorsConfig, ignoreErrorsConfig);
    } finally {
      setTimeout(
        () => this._getIgnoreErrorsConfig(),
        IGNORE_ERRORS_CONFIG_UPDATE_INTERVAL
      );
    }
  }

  async shouldIgnoreError(context, message) {
    return (
      this._ignoreErrorsConfig.ignoreAll ||
      this._ignoreErrorsConfig[context].some(str => {
        const re = new RegExp(str);

        return re.test(message);
      })
    );
  }
}
