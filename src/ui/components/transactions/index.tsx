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
import issue from './Issue';
import reissue from './Reissue';
import sponsorShip from './Sponsorship';
import data from './Data';
import setScript from './SetScript';
import assetScript from './AssetScript';
import scriptInvocation from './ScriptInvocation';
import packageTx from './Package';
import unknown from './Unknown';

const MESSAGES = [
    auth,
    alias,
    originAuth,
    transfer,
    burn,
    lease,
    cancelLease,
    createOrder,
    cancelOrder,
    matcher,
    coinomatConfirm,
    massTransfer,
    issue,
    reissue,
    sponsorShip,
    data,
    setScript,
    assetScript,
    scriptInvocation,
    packageTx,
];

export { FinalTransaction } from './FinalTransaction';

export const getConfigByTransaction = ({ data: tx, type = null}) => {
    return MESSAGES.find((config) => config.isMe(tx, type)) || unknown;
};
