import ObservableStore from 'obs-store';
import { BLACK_LIST_CONFIG } from "../constants";

export const PERMISSIONS = {
    ALL: 'all',
    REJECTED: 'rejected',
    APPROVED: 'rejected',
};

export class OriginController {

    constructor(options = {}) {
        const defaults = {
            origins: {},
            blacklist: [],
            whitelist: [],

        };

        this.store = new ObservableStore({ ...defaults, ...options.initState});
        this._getBlackList();
    }

    getPermissions(origin) {
        const {  origins, blacklist } = this.store.getState();
        
        if (blacklist.includes(origin)) {
            return [ PERMISSIONS.REJECTED ];
        }
        
        return origins[origin] || [];
    }
    
    setPermissions(origin, permissions) {
        this.updateState({ origins: { [origin]: permissions } })
    }

    getScam() {
        return fetch(BLACK_LIST_CONFIG)
            .then(resp => resp.text())
            .then(txt => JSON.parse(txt))
    }

    updateState(state) {
        const {  origins: oldOrigins, ...oldState} = this.store.getState();
        const origins = { ...oldOrigins, ...(state.origins || {}) };
        this.store.updateState({ origins, ...oldState });
    }

    async _getBlackList() {
        try {
            const { blacklist, whitelist } = await this.getScam();
            this.updateState({ blacklist, whitelist })
        } catch (e) {
        }
    }
}
