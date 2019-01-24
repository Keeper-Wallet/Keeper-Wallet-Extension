import { Unknown } from './Unknown';
import { UnknownCard } from './UnknownCard';
import { UnknownFinal } from './UnknownFinal';
import { UnknownInfo } from './UnknownInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const unknown = {
    type: messageType,
    message: Unknown,
    card: UnknownCard,
    final: UnknownFinal,
    info: UnknownInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default unknown;
