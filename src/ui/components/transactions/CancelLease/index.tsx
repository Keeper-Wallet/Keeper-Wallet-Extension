import { CancelLease } from './CancelLease';
import { CancelLeaseCard } from './CancelLeaseCard';
import { CancelLeaseFinal } from './CancelLeaseFinal';
import * as utils from './parseTx';

const lease = {
  type: utils.messageType,
  message: CancelLease,
  card: CancelLeaseCard,
  final: CancelLeaseFinal,
  ...utils,
};

export default lease;
