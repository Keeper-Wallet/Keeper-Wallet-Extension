import { CancelLease } from './CancelLease';
import { CancelLeaseCard } from './CancelLeaseCard';
import { CancelLeaseFinal } from './CancelLeaseFinal';
import { CancelLeaseInfo } from './CancelLeaseInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const lease = {
    type: messageType,
    message: CancelLease,
    card: CancelLeaseCard,
    final: CancelLeaseFinal,
    info: CancelLeaseInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default lease;
