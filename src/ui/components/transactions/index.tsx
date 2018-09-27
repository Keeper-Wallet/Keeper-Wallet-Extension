import { SIGN_TYPE, getAdapterByType, AdapterType } from '@waves/signature-adapter';
import { Transfer } from './Transfer';
import { Auth } from './Auth';

export * from './Transfer';
export * from './TransactionIcon';

export const getConfigByTransaction = tx => {
    const config = {
        type: null,
        component: null,
    };

    switch (tx.type) {
        case SIGN_TYPE.TRANSFER:
            config.type = 'transfer';
            config.component = Transfer;
            break;
        case SIGN_TYPE.AUTH:
            config.type = 'auth';
            config.component = Auth;
        default:
            config.type = 'unknown';
            config.component = null;
    }

    return config;
};

export const getTxId = tx => {
    const Adapter = getAdapterByType(AdapterType.Seed);
    const adapter = new Adapter('system for tx id');
    const signData = adapter.makeSignable(tx);
    return signData.getId();
};
