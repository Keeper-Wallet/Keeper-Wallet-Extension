import alias from './Alias';
import assetScript from './AssetScript';
import auth from './Auth';
import burn from './Burn';
import cancelLease from './CancelLease';
import cancelOrder from './CancelOrder';
import createOrder from './CreateOrder';
import customData from './CustomData';
import data from './Data';
import issue from './Issue';
import lease from './Lease';
import massTransfer from './MassTransfer';
import matcher from './MatcherOrders';
import originAuth from './OriginAuth';
import packageTx from './Package';
import reissue from './Reissue';
import scriptInvocation from './ScriptInvocation';
import setScript from './SetScript';
import sponsorShip from './Sponsorship';
import transfer from './Transfer';
import unknown from './Unknown';
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

export function getConfigByTransaction({
  data: tx,
  type = null,
}: {
  data: { type?: unknown };
  type: string | null;
}) {
  return MESSAGES.find(config => config.isMe(tx, type)) || unknown;
}
