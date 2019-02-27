import ObservableStore from 'obs-store';
import { BigNumber } from "@waves/data-entities/dist/libs/bignumber";

export const PERMISSIONS = {
    ALL: 'all',
    USE_API: 'useApi',
    REJECTED: 'rejected',
    APPROVED: 'approved',
    AUTO_SIGN: 'allowAutoSign',
};

const findPermissionFabric = permission => item => {
    if (typeof item === 'string') {
        return item === permission;
    }

    const { type } = item;
    return type === permission;
};

export class PermissionsController {

    constructor(options = {}) {
        const defaults = {
            origins: {},
            blacklist: [],
            whitelist: [],
            inPending: {},
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
            return [ PERMISSIONS.APPROVED ];
        }

        return origins[origin] || [];
    }

    getPermission(origin, permission) {
        const permissions = this.getPermissions(origin);
        const permissionType = typeof permission === 'string' ? permission : permission.type;
        const findPermission = findPermissionFabric(permissionType);
        return permissions.find(findPermission);
    }

    hasPermission(origin, permission) {
        const permissions = this.getPermissions(origin);

        if (permissions.includes(PERMISSIONS.REJECTED)) {
            return false;
        }

        if (permissions.includes(PERMISSIONS.ALL)) {
            return true;
        }

        return !!this.getPermission(origin, permission);
    }

    deletePermissions(origin) {
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

    setPermission(origin, permission) {
        if (this.hasPermission(origin, permission)) {
            return null;
        }

        const permissions = [ ...this.getPermissions(origin) || []];
        permissions.push(permission);
        this.setPermissions(origin, permissions);
    }

    deletePermission(origin, permission) {
        if (!this.hasPermission(origin, permission)) {
            return null;
        }
        const permissionType = typeof permission === 'string' ? permission : permission.type;
        const findPermission = findPermissionFabric(permissionType);
        const permissions = this.getPermissions(origin).filter(item => !findPermission(item));
        this.setPermissions(origin, permissions);
    }

    canApprove(origin, tx) {
        const permission = this.getPermission(origin, PERMISSIONS.AUTO_SIGN);

        if (!permission) {
            return false;
        }

        const currentTime = Date.now();
        let { totalAmount = 0, interval = 0, approved = [] }  = permission;

        approved = approved.filter(({ time }) => currentTime - time < interval );
        const total = new BigNumber(totalAmount);
        const amount = approved.reduce((acc, { amount }) => acc.plus(new BigNumber(amount)), new BigNumber(0));

        debugger;
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
