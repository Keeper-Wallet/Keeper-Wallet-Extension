import { SIGN_TYPE, getAdapterByType, AdapterType } from '@waves/signature-adapter';
import { Transfer } from './Transfer';
import { MassTransfer } from './MassTransfer';
import { Auth } from './Auth';
import { Burn } from './Burn';
import { Issure } from './Issure';
import { ReIssure } from './ReIssure';
import { Alias } from './Alias';
import { Lease } from './Lease';
import { CancelLease } from './CancelLease';
import { CancelOrder } from './CancelOrder';
import { CreateOrder } from './CreateOrder';
import { Matcher } from './Matcher';
import { Data } from './Data';
import { SponsorShip } from './SponsorShip';
import { SetScript } from './SetScript';
import { SignClass } from './SignClass';

export { FinalTransaction } from './FinalTransaction';

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
            config.component = CancelLease;
            break;
        case SIGN_TYPE.CANCEL_ORDER:
            config.type = 'cancel-order';
            config.component = CancelOrder;
            break;
        case SIGN_TYPE.CREATE_ALIAS:
            config.type = 'create-alias';
            config.component = Alias;
            break;
        case SIGN_TYPE.CREATE_ORDER:
            config.type = 'create-order';
            config.component = CreateOrder;
            break;
        case SIGN_TYPE.DATA:
            config.type = 'data';
            config.component = Data;
            break;
        case SIGN_TYPE.ISSUE:
            config.type = 'issue';
            config.component = Issure;
            break;
        case SIGN_TYPE.LEASE:
            config.type = 'lease';
            config.component = Lease;
            break;
        case SIGN_TYPE.MASS_TRANSFER:
            config.type = 'mass_transfer';
            config.component = MassTransfer;
            break;
        case SIGN_TYPE.MATCHER_ORDERS:
            config.type = 'matcher_orders';
            config.component = Matcher;
            break;
        case SIGN_TYPE.REISSUE:
            config.type = 'reissue';
            config.component = ReIssure;
            break;
        case SIGN_TYPE.SET_SCRIPT:
            config.type = 'set-script';
            config.component = SetScript;
            break;
        case SIGN_TYPE.SPONSORSHIP:
            config.type = 'sponsorship';
            config.component = SponsorShip;
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
