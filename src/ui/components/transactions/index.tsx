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
import alias from './Alias';
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
import { CoinomatConfirm } from './CoinomatConfirm';
import { CoinomatConfirmFinal } from './CoinomatConfirmFinal';
import { Data } from './Data';
import { DataFinal } from './DataFinal';
import { SponsorShip } from './SponsorShip';
import { SponsorShipFinal } from './SponsorShipFinal';
import { SetScript } from './SetScript';
import { SetScriptFinal } from './SetScriptFinal';
import { SetAssetScript } from './SetAssetScript';
import { SetAssetScriptFinal } from './SetAssetScriptFinal';
import { CustomSign } from './CustomSign';
import { CustomSignFinal } from './CustomSignFinal';
import { Unknown } from './Unknown';
import { UnknownFinal } from './UnknownFinal';
import { OriginAuth } from './OriginAuth';
import { OriginAuthFinal } from './OriginAuthFinal';

export { FinalTransaction } from './FinalTransaction';

export const getConfigByTransaction = (tx, type = null) => {
    const config = {
        type: null,
        component: null,
        final: null,
        card: null,
        components: null,
    };
    
    switch (true) {
        case type === 'authOrigin':
            config.type = 'authOrigin';
            config.component = OriginAuth;
            config.final = OriginAuthFinal;
            break;
        case tx.type === SIGN_TYPE.TRANSFER && type === 'transaction':
            config.type = 'transfer';
            config.component = Transfer;
            config.final = TransferFinal;
            break;
        case tx.type ===  SIGN_TYPE.AUTH && type === 'auth':
            config.type = 'auth';
            config.component = Auth;
            config.final = AuthFinal;
            break;
        case tx.type ===  SIGN_TYPE.BURN && type === 'transaction':
            config.type = 'burn';
            config.component = Burn;
            config.final = BurnFinal;
            break;
        case tx.type === SIGN_TYPE.CANCEL_LEASING && type === 'transaction':
            config.type = 'cancel-leasing';
            config.component = CancelLease;
            config.final = CancelLeaseFinal;
            break;
        case tx.type === SIGN_TYPE.CANCEL_ORDER && (type === 'cancelOrder' || type === 'request'):
            config.type = 'cancel-order';
            config.component = CancelOrder;
            config.final = CancelOrderFinal;
            break;
        case tx.type === SIGN_TYPE.CREATE_ALIAS && type === 'transaction':
            config.type = 'create-alias';
            config.component = alias.Alias;
            config.final = alias.AliasFinal;
            config.card = alias.AliasCard;
            config.components = alias;
            break;
        case tx.type === SIGN_TYPE.CREATE_ORDER && type === 'order':
            config.type = 'create-order';
            config.component = CreateOrder;
            config.final = CreateOrderFinal;
            break;
        case tx.type === SIGN_TYPE.DATA && type === 'transaction':
            config.type = 'data';
            config.component = Data;
            config.final = DataFinal;
            break;
        case tx.type === SIGN_TYPE.ISSUE && type === 'transaction':
            config.type = 'issue';
            config.component = Issure;
            config.final = IssureFinal;
            break;
        case tx.type === SIGN_TYPE.LEASE && type === 'transaction':
            config.type = 'lease';
            config.component = Lease;
            config.final = LeaseFinal;
            break;
        case tx.type === SIGN_TYPE.MASS_TRANSFER && type === 'transaction':
            config.type = 'mass_transfer';
            config.component = MassTransfer;
            config.final = MassTransferFinal;
            break;
        case tx.type === SIGN_TYPE.MATCHER_ORDERS && type === 'request':
            config.type = 'matcher_orders';
            config.component = Matcher;
            config.final = MatcherFinal;
            break;
        case tx.type === SIGN_TYPE.COINOMAT_CONFIRMATION && type === 'request':
            config.type = 'coinomat_confirm';
            config.component = CoinomatConfirm;
            config.final = CoinomatConfirmFinal;
            break;
        case tx.type === SIGN_TYPE.REISSUE && type === 'transaction':
            config.type = 'reissue';
            config.component = ReIssure;
            config.final = ReIssureFinal;
            break;
        case tx.type === SIGN_TYPE.SET_SCRIPT && type === 'transaction':
            config.type = 'set-script';
            config.component = SetScript;
            config.final = SetScriptFinal;
            break;
        case tx.type === SIGN_TYPE.SET_ASSET_SCRIPT && type === 'transaction':
            config.type = 'set-asset-script';
            config.component = SetAssetScript;
            config.final = SetAssetScriptFinal;
            break;
        case tx.type === SIGN_TYPE.SPONSORSHIP && type === 'transaction':
            const { minSponsoredAssetFee } = tx.data;
            const zero = minSponsoredAssetFee.cloneWithTokens(0);
            config.type = minSponsoredAssetFee.gt(zero) ? 'sponsor_enable' : 'sponsor_disable';
            config.component = SponsorShip;
            config.final = SponsorShipFinal;
            break;
        case tx.type === -1 && type === 'request':
            config.type = 'custom';
            config.component = CustomSign;
            config.final = CustomSignFinal;
        default:
            config.type = 'unknown';
            config.component = Unknown;
            config.final = UnknownFinal;
    }
    
    return config;
};
