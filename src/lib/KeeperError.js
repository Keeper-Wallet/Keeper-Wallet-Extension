class KeeperError extends Error {
    constructor(text, code, data) {
        super(text);
        this.data = data;
        this.code = code;
    }
}

export const ERRORS = {
    USER_DENIED: () => new KeeperError('User denied message', 10),
    UNKNOWN: () => new KeeperError('Unknown error', 11),
    API_DENIED: () => new KeeperError('Api rejected by user', 12),
    INIT_KEEPER: () => new KeeperError('Init Waves Keeper and add account', 13),
    EMPTY_KEEPER: () => new KeeperError('Add Waves Keeper account', 14),
    REQUEST_ERROR: (data) => new KeeperError('Invalid data', 9, data),
};
