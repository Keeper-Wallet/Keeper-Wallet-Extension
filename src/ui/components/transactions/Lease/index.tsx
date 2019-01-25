import { Lease } from './Lease';
import { LeaseCard } from './LeaseCard';
import { LeaseFinal } from './LeaseFinal';
import { LeaseInfo } from './LeaseInfo';
import * as utils from './parseTx';
const lease = {
    type: utils.messageType,
    message: Lease,
    card: LeaseCard,
    final: LeaseFinal,
    info: LeaseInfo,
    ...utils,
};

export default lease;
