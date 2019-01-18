import ObservableStore from 'obs-store';
import { BLACK_LIST_CONFIG } from "../constants";

export const PERMISSIONS = {
    ALL: 'all',
    SIGN_API: 'signApi',
    REJECTED: 'rejected',
    APPROVED: 'approved',
};

export class OriginController {

    constructor(options = {}) {
        const defaults = {
            origins: {},
            blacklist: [],
            whitelist: [],
            inPending: {}

        };

        this.store = new ObservableStore({ ...defaults, ...options.initState});
        this._getBlackList();
    }

    getMessageIdAccess(origin) {
        const { inPending } = this.store.getState();
        return inPending[origin] || null;
    }

    setMessageIdAccess(origin, messageId) {
        this.updateState({ inPending: { [origin]: messageId } });
    }

    getPermissions(origin) {
        const { origins, blacklist, whitelist } = this.store.getState();
        
        if (blacklist.includes(origin)) {
            return [ PERMISSIONS.REJECTED ];
        }

        if (whitelist.includes(origin)) {
            return [ PERMISSIONS.ALL ];
        }
        
        return origins[origin] || [];
    }

    hasPermission(origin, permission) {
        const permissions = this.getPermissions(origin);

        if (permission.includes(PERMISSIONS.REJECTED)) {
            return false;
        }

        if (permission.includes(PERMISSIONS.ALL)) {
            return true;
        }

        return permissions.includes(permission) ? true : null;
    }

    setPermissions(origin, permissions) {
        this.setMessageIdAccess(origin, null);
        this.updateState({ origins: { [origin]: permissions } })
    }

    getConfig() {
        return fetch(BLACK_LIST_CONFIG)
            .then(resp => resp.text())
            .then(txt => JSON.parse(txt))
    }

    updateState(state) {
        const {  origins: oldOrigins, inPending: oldInPending, ...oldState} = this.store.getState();
        const origins = { ...oldOrigins, ...(state.origins || {}) };
        const whitelist = state.whitelist || oldState.whitelist;
        const blacklist = state.blacklist || oldState.blacklist;
        const inPending = { ...oldInPending, ...(state.inPending || {})};
        const newState = {
            ...oldState,
            ...state,
            origins,
            whitelist,
            blacklist,
            inPending
        };

        this.store.updateState(newState);
    }

    async _getBlackList() {
        try {
            const { blacklist, whitelist } = await this.getConfig();
            this.updateState({ blacklist, whitelist })
        } catch (e) {
        }
    }
}
