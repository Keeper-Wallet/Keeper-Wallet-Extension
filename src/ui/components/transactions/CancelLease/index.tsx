import { CancelLease } from './CancelLease';
import { CancelLeaseCard } from './CancelLeaseCard';
import { CancelLeaseFinal } from './CancelLeaseFinal';
import { CancelLeaseInfo } from './CancelLeaseInfo';
import * as utils from './parseTx';

const lease = {
    type: utils.messageType,
    message: CancelLease,
    card: CancelLeaseCard,
    final: CancelLeaseFinal,
    info: CancelLeaseInfo,
    ...utils,
};

export default lease;
