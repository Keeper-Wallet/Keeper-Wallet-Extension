import { Transfer } from './Transfer';
import { TransferCard } from './TransferCard';
import { TransferFinal } from './TransferFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const transfer: MessageConfig = {
  type: utils.messageType,
  message: Transfer,
  card: TransferCard,
  final: TransferFinal,
  ...utils,
};

export default transfer;
