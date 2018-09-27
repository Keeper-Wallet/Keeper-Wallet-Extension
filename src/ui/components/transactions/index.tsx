import { SIGN_TYPE, getAdapterByType, AdapterType } from '@waves/signature-adapter';
import { Transfer } from './Transfer';
import { Auth } from './Auth';
import { Burn } from './Burn';
import { SignClass } from './SignClass';

export * from './Transfer';
export * from './Auth';
export * from './TransactionIcon';
export * from './SignClass';

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
            break;
        case SIGN_TYPE.BURN:
            config.type = 'burn';
            config.component = Burn;
            break;
        case SIGN_TYPE.CANCEL_LEASING:
            config.type = 'cancel-leasing';
            config.component = SignClass;
            break;
        case SIGN_TYPE.CANCEL_ORDER:
            config.type = 'cancel-order';
            config.component = SignClass;
            break;
        case SIGN_TYPE.CREATE_ALIAS:
            config.type = 'create-alias';
            config.component = SignClass;
            break;
        case SIGN_TYPE.CREATE_ORDER:
            config.type = 'create-order';
            config.component = SignClass;
            break;
        case SIGN_TYPE.DATA:
            config.type = 'data';
            config.component = SignClass;
            break;
        case SIGN_TYPE.ISSUE:
            config.type = 'issue';
            config.component = SignClass;
            break;
        case SIGN_TYPE.LEASE:
            config.type = 'lease';
            config.component = SignClass;
            break;
        case SIGN_TYPE.MASS_TRANSFER:
            config.type = 'mass_transfer';
            config.component = SignClass;
            break;
        case SIGN_TYPE.MATCHER_ORDERS:
            config.type = 'matcher_orders';
            config.component = SignClass;
            break;
        case SIGN_TYPE.REISSUE:
            config.type = 'reissue';
            config.component = SignClass;
            break;
        case SIGN_TYPE.SET_SCRIPT:
            config.type = 'set-script';
            config.component = SignClass;
            break;
        case SIGN_TYPE.SPONSORSHIP:
            config.type = 'sponsorship';
            config.component = SignClass;
            break;
        default:
            config.type = 'unknown';
            config.component = SignClass;
    }
    
    return config;
};

export const getTxId = tx => {
    const Adapter = getAdapterByType(AdapterType.Seed);
    const adapter = new Adapter('system for tx id');
    const signData = adapter.makeSignable(tx);
    return signData.getId();
};
