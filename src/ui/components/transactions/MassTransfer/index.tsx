import { MassTransfer } from './MassTransfer';
import { MassTransferCard } from './MassTransferCard';
import { MassTransferFinal } from './MassTransferFinal';
import * as utils from './parseTx';

const transfer = {
  type: utils.messageType,
  message: MassTransfer,
  card: MassTransferCard,
  final: MassTransferFinal,
  ...utils,
};

export default transfer;
