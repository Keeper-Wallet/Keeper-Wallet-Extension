import ObservableStore from 'obs-store';

export const PERMISSIONS = {
    ALL: 'all',
    SIGN_API: 'signApi',
    REJECTED: 'rejected',
    APPROVED: 'approved',
};

export class PermissionsController {

    constructor(options = {}) {
        const defaults = {
            origins: {},
            blacklist: [],
            whitelist: [],
            inPending: {}

        };

        this.remoteConfig = options.remoteConfig;
        this.store = new ObservableStore({ ...defaults, ...options.initState});
        this._updateByConfig();
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

        if (permissions.includes(PERMISSIONS.REJECTED)) {
            return false;
        }

        if (permissions.includes(PERMISSIONS.ALL)) {
            return true;
        }

        return permissions.includes(permission) ? true : null;
    }

    deletePermission(origin) {
        const {  origins, ...other } = this.store.getState();

        if (origins.hasOwnProperty(origin)) {
            delete origins[origin];
        }

        this.store.updateState({ ...other, origins });
    }

    setPermissions(origin, permissions) {
        this.setMessageIdAccess(origin, null);
        this.updateState({ origins: { [origin]: permissions } })
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

    _updateByConfig() {
        const { blacklist, whitelist } = this.remoteConfig.store.getState();
        this.updateState({ blacklist, whitelist });
        this.remoteConfig.store.subscribe(({ blacklist, whitelist }) => this.updateState({ blacklist, whitelist }));
    }
}
