import { MessageConfig } from '../types';
import { MatcherCard } from './MatcherCard';
import { MatcherFinal } from './MatcherFinal';
import { MatcherOrders } from './MatcherOrders';
import * as utils from './parseTx';

const matcher: MessageConfig = {
  type: utils.messageType,
  message: MatcherOrders,
  card: MatcherCard,
  final: MatcherFinal,
  ...utils,
};

export default matcher;
