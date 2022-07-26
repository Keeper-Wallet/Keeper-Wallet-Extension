import { MatcherOrders } from './MatcherOrders';
import { MatcherCard } from './MatcherCard';
import { MatcherFinal } from './MatcherFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const matcher: MessageConfig = {
  type: utils.messageType,
  message: MatcherOrders,
  card: MatcherCard,
  final: MatcherFinal,
  ...utils,
};

export default matcher;
