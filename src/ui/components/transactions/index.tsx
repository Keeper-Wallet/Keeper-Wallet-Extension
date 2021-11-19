import { ComponentType } from 'react';
import { IMoneyLike } from 'ui/utils/converters';
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
import { Money } from '@waves/data-entities';

interface Message {
  card: ComponentType<{
    assets?: unknown;
    className?: string;
    collapsed: boolean;
    message: unknown;
  }>;
  getAmount?: (tx: unknown, item: unknown) => IMoneyLike | Money;
  getAmounts?: (tx: unknown) => IMoneyLike[];
  getAmountSign: (tx: unknown) => '-' | '+' | '';
  getAssetsId: (tx: unknown) => string[];
  getFee: (tx: unknown) => IMoneyLike;
  isMe: (tx: unknown, type: unknown) => boolean;
  message: ComponentType<{
    approve?: unknown;
    assets?: unknown;
    autoClickProtection?: unknown;
    message?: unknown;
    pending?: unknown;
    reject?: unknown;
    rejectForever?: unknown;
    selectAccount?: unknown;
    selectedAccount?: unknown;
    sponsoredBalance?: unknown;
    txHash?: unknown;
    txType?: unknown;
    onClose?: unknown;
    onList?: unknown;
    onNext?: unknown;
  }>;
  type: unknown;
}

const MESSAGES: Message[] = [
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

export function getConfigByTransaction({ data: tx, type = null }): Message {
  return MESSAGES.find(config => config.isMe(tx, type)) || unknown;
}
