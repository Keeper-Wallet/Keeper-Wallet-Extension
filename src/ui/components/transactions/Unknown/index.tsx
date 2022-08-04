import { Unknown } from './Unknown';
import { UnknownCard } from './UnknownCard';
import { UnknownFinal } from './UnknownFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const unknown: MessageConfig = {
  type: utils.messageType,
  message: Unknown,
  card: UnknownCard,
  final: UnknownFinal,
  ...utils,
};

export default unknown;
