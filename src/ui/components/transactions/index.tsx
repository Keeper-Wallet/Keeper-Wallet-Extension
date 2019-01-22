import { SIGN_TYPE } from '@waves/signature-adapter';

import auth from './Auth';
import alias from './Alias';
import originAuth from './OriginAuth';
import transfer from './Transfer';
import burn from './Burn';
import lease from './Lease';
import cancelLease from './CancelLease';
import createOrder from './CreateOrder';
import cancelOrder from './CancelOrder';
import matcher from './MatcherOrders';
import coinomatConfirm from './CoinomatConfirm';
import massTransfer from './MassTransfer';

import { Issure } from './Issure';
import { IssureFinal } from './IssureFinal';
import { ReIssure } from './ReIssure';
import { ReIssureFinal } from './ReIssureFinal';
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
        case originAuth.isMe(tx, type):
            config.type = originAuth.type;
            config.component = originAuth.message;
            config.final = originAuth.final;
            config.components = originAuth;
            break;
        case transfer.isMe(tx, type):
            config.type = transfer.type;
            config.component = transfer.message;
            config.final = transfer.final;
            config.components = transfer;
            break;
        case auth.isMe(tx, type):
            config.type = auth.type;
            config.component = auth.message;
            config.final = auth.final;
            config.components = auth;
            break;
        case alias.isMe(tx, type):
            config.type = alias.type;
            config.component = alias.message;
            config.final = alias.final;
            config.card = alias.card;
            config.components = alias;
            break;
        case burn.isMe(tx, type):
            config.type = burn.type;
            config.component = burn.message;
            config.final = burn.final;
            config.components = burn;
            break;
        case lease.isMe(tx, type):
            config.type = lease.type;
            config.component = lease.message;
            config.final = lease.final;
            config.components = lease;
            break;
        case cancelLease.isMe(tx, type):
            config.type = cancelLease.type;
            config.component = cancelLease.message;
            config.final = cancelLease.final;
            config.components = cancelLease;
            break;
        case createOrder.isMe(tx, type):
            config.type = createOrder.type;
            config.component = createOrder.message;
            config.final = createOrder.final;
            config.components = createOrder;
            break;
        case cancelOrder.isMe(tx, type):
            config.type = cancelOrder.type;
            config.component = cancelOrder.message;
            config.final = cancelOrder.final;
            config.components = cancelOrder;
            break;
        case matcher.isMe(tx, type):
            config.type = matcher.type;
            config.component = matcher.message;
            config.final = matcher.final;
            config.components = matcher;
            break;
        case coinomatConfirm.isMe(tx, type):
            config.type = coinomatConfirm.type;
            config.component = coinomatConfirm.message;
            config.final = coinomatConfirm.final;
            config.components = coinomatConfirm;
            break;
        case massTransfer.isMe(tx, type):
            config.type = massTransfer.type;
            config.component = massTransfer.message;
            config.final = massTransfer.final;
            config.components = massTransfer;
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
