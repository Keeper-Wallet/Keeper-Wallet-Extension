import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { Transfer } from './Transfer';
import { TransferCard } from './TransferCard';
import { TransferFinal } from './TransferFinal';

const transfer: MessageConfig = {
  type: utils.messageType,
  message: Transfer,
  card: TransferCard,
  final: TransferFinal,
  ...utils,
};

export default transfer;
