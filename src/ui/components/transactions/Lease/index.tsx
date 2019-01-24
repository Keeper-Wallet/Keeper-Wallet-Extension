import { Lease } from './Lease';
import { LeaseCard } from './LeaseCard';
import { LeaseFinal } from './LeaseFinal';
import { LeaseInfo } from './LeaseInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const lease = {
    type: messageType,
    message: Lease,
    card: LeaseCard,
    final: LeaseFinal,
    info: LeaseInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default lease;
