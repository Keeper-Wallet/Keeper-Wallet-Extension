import { Unknown } from './Unknown';
import { UnknownCard } from './UnknownCard';
import { UnknownFinal } from './UnknownFinal';
import * as utils from './parseTx';

const unknown = {
  type: utils.messageType,
  message: Unknown,
  card: UnknownCard,
  final: UnknownFinal,
  ...utils,
};

export default unknown;
