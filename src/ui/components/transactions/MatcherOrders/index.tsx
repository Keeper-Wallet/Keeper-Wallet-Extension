import { MatcherOrders } from './MatcherOrders';
import { MatcherCard } from './MatcherCard';
import { MatcherFinal } from './MatcherFinal';
import { MatcherInfo } from './MatcherInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const auth = {
    type: messageType,
    message: MatcherOrders,
    card: MatcherCard,
    final: MatcherFinal,
    info: MatcherInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe
};

export default auth;
