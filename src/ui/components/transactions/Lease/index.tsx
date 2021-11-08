import { Lease } from './Lease';
import { LeaseCard } from './LeaseCard';
import { LeaseFinal } from './LeaseFinal';
import * as utils from './parseTx';

const lease = {
  type: utils.messageType,
  message: Lease,
  card: LeaseCard,
  final: LeaseFinal,
  ...utils,
};

export default lease;
