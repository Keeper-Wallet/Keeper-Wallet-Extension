import ObservableStore from 'obs-store';
import { CONFIG_URL, DEFAULT_CONFIG, STATUS } from "../constants";



export class RemoteConfigController {

    constructor(options = {}) {
        const defaults = {
            blacklist: [],
            whitelist: [],
            networks: DEFAULT_CONFIG.NETWORKS,
            network_config: DEFAULT_CONFIG.NETWORK_CONFIG,
            messages_config: DEFAULT_CONFIG.MESSAGES_CONFIG,
            pack_config: DEFAULT_CONFIG.MESSAGES_CONFIG,
            status: STATUS.PENDING,
        };

        this.store = new ObservableStore({ ...defaults, ...options.initState});
        this._getConfig();
    }

    getPackConfig() {
        const { pack_config } = this.store.getState();

        const config = Object.entries(pack_config).reduce((config, [key, value]) => {
            acc[key] = value || DEFAULT_CONFIG.PACK_CONFIG[key];
        }, Object.create(null));

        return config;
    }

    getMessagesConfig() {
        const { messages_config } = this.store.getState();

        const config = Object.entries(messages_config).reduce((config, [key, value]) => {
            acc[key] = value || DEFAULT_CONFIG.MESSAGES_CONFIG[key];
        }, Object.create(null));

        return config;
    }

    getBlacklist() {
        const { blacklist } =  this.store.getState();

        if (Array.isArray(blacklist)) {
            return blacklist.filter(item => typeof item === 'string');
        }

        return [];
    }

    getWhitelist() {
        const { whitelist } =  this.store.getState();

        if (Array.isArray(whitelist)) {
            return whitelist.filter(item => typeof item === 'string');
        }

        return [];
    }

    getNetworkConfig() {
        return this.store.getState().network_config || DEFAULT_CONFIG.NETWORK_CONFIG;
    }

    getNetworks() {
        return this.store.getState().networks || DEFAULT_CONFIG.NETWORKS;
    }

    fetchConfig() {
        return fetch(CONFIG_URL)
            .then(resp => resp.text())
            .then(txt => JSON.parse(txt))
    }

    updateState(state) {
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
                pack_config = DEFAULT_CONFIG.PACK_CONFIG,
            } = await this.fetchConfig();

            this.updateState({
                blacklist,
                whitelist,
                networks,
                network_config,
                messages_config,
                pack_config,
                status: STATUS.UPDATED
            })
        } catch (e) {
            this.updateState({ status: STATUS.ERROR });
        }

        clearTimeout(this._timer);

        this._timer = setTimeout(
            () => this._getConfig(), DEFAULT_CONFIG.CONFIG.update_ms
        );
    }
}
