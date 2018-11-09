import { SIGN_TYPE } from '@waves/signature-adapter';
import { Transfer } from './Transfer';
import { TransferFinal } from './TransferFinal';
import { MassTransfer } from './MassTransfer';
import { MassTransferFinal } from './MassTransferFinal';
import { Auth } from './Auth';
import { AuthFinal } from './AuthFinal';
import { Burn } from './Burn';
import { BurnFinal } from './BurnFinal';
import { Issure } from './Issure';
import { IssureFinal } from './IssureFinal';
import { ReIssure } from './ReIssure';
import { ReIssureFinal } from './ReIssureFinal';
import { Alias } from './Alias';
import { AliasFinal } from './AliasFinal';
import { Lease } from './Lease';
import { LeaseFinal } from './LeaseFinal';
import { CancelLease } from './CancelLease';
import { CancelLeaseFinal } from './CancelLeaseFinal';
import { CancelOrder } from './CancelOrder';
import { CancelOrderFinal } from './CancelOrderFinal';
import { CreateOrder } from './CreateOrder';
import { CreateOrderFinal } from './CreateOrderFinal';
import { Matcher } from './Matcher';
import { MatcherFinal } from './MatcherFinal';
import { Data } from './Data';
import { DataFinal } from './DataFinal';
import { SponsorShip } from './SponsorShip';
import { SponsorShipFinal } from './SponsorShipFinal';
import { SetScript } from './SetScript';
import { SetScriptFinal } from './SetScriptFinal';
import { CustomSign } from './CustomSign';
import { CustomSignFinal } from './CustomSignFinal';
import { SignClass } from './SignClass';

export { FinalTransaction } from './FinalTransaction';

export const getConfigByTransaction = tx => {
    const config = {
        type: null,
        component: null,
        final: null,
    };
    
    switch (tx.type) {
        case SIGN_TYPE.TRANSFER:
            config.type = 'transfer';
            config.component = Transfer;
            config.final = TransferFinal;
            break;
        case SIGN_TYPE.AUTH:
            config.type = 'auth';
            config.component = Auth;
            config.final = AuthFinal;
            break;
        case SIGN_TYPE.BURN:
            config.type = 'burn';
            config.component = Burn;
            config.final = BurnFinal;
            break;
        case SIGN_TYPE.CANCEL_LEASING:
            config.type = 'cancel-leasing';
            config.component = CancelLease;
            config.final = CancelLeaseFinal;
            break;
        case SIGN_TYPE.CANCEL_ORDER:
            config.type = 'cancel-order';
            config.component = CancelOrder;
            config.final = CancelOrderFinal;
            break;
        case SIGN_TYPE.CREATE_ALIAS:
            config.type = 'create-alias';
            config.component = Alias;
            config.final = AliasFinal;
            break;
        case SIGN_TYPE.CREATE_ORDER:
            config.type = 'create-order';
            config.component = CreateOrder;
            config.final = CreateOrderFinal;
            break;
        case SIGN_TYPE.DATA:
            config.type = 'data';
            config.component = Data;
            config.final = DataFinal;
            break;
        case SIGN_TYPE.ISSUE:
            config.type = 'issue';
            config.component = Issure;
            config.final = IssureFinal;
            break;
        case SIGN_TYPE.LEASE:
            config.type = 'lease';
            config.component = Lease;
            config.final = LeaseFinal;
            break;
        case SIGN_TYPE.MASS_TRANSFER:
            config.type = 'mass_transfer';
            config.component = MassTransfer;
            config.final = MassTransferFinal;
            break;
        case SIGN_TYPE.MATCHER_ORDERS:
            config.type = 'matcher_orders';
            config.component = Matcher;
            config.final = MatcherFinal;
            break;
        case SIGN_TYPE.REISSUE:
            config.type = 'reissue';
            config.component = ReIssure;
            config.final = ReIssureFinal;
            break;
        case SIGN_TYPE.SET_SCRIPT:
            config.type = 'set-script';
            config.component = SetScript;
            config.final = SetScriptFinal;
            break;
        case SIGN_TYPE.SPONSORSHIP:
            const { minSponsoredAssetFee } = tx.data;
            const zero = minSponsoredAssetFee.cloneWithTokens(0);
            config.type = minSponsoredAssetFee.gt(zero) ? 'sponsor_enable' : 'sponsor_disable';
            config.component = SponsorShip;
            config.final = SponsorShipFinal;
            break;
        case -1:
            config.type = 'custom';
            config.component = CustomSign;
            config.final = CustomSignFinal;
        default:
            config.type = 'unknown';
            config.component = SignClass;
            config.final = null;
    }
    
    return config;
};
