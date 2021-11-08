import { MatcherOrders } from './MatcherOrders';
import { MatcherCard } from './MatcherCard';
import { MatcherFinal } from './MatcherFinal';
import * as utils from './parseTx';

const auth = {
  type: utils.messageType,
  message: MatcherOrders,
  card: MatcherCard,
  final: MatcherFinal,
  ...utils,
};

export default auth;
