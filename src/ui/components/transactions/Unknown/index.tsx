import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { Unknown } from './Unknown';
import { UnknownCard } from './UnknownCard';
import { UnknownFinal } from './UnknownFinal';

const unknown: MessageConfig = {
  type: utils.messageType,
  message: Unknown,
  card: UnknownCard,
  final: UnknownFinal,
  ...utils,
};

export default unknown;
