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
import customData from './CustomData';
import updateAssetInfo from './UpdateAssetInfo';
import wavesAuth from './WavesAuth';

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
  massTransfer,
  issue,
  reissue,
  sponsorShip,
  data,
  setScript,
  assetScript,
  scriptInvocation,
  packageTx,
  customData,
  updateAssetInfo,
  wavesAuth,
];

export { FinalTransaction } from './FinalTransaction';

export function getConfigByTransaction({
  data: tx,
  type = null,
}: {
  data: { type?: unknown };
  type: string | null;
}) {
  return MESSAGES.find(config => config.isMe(tx, type)) || unknown;
}
