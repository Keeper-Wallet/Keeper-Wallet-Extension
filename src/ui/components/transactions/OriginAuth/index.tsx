import { OriginAuth } from './OriginAuth';
import { OriginAuthCard } from './OriginAuthCard';
import { OriginAuthFinal } from './OriginAuthFinal';
import { OriginAuthInfo } from './OriginAuthInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const originAuth = {
    type: messageType,
    message: OriginAuth,
    card: OriginAuthCard,
    final: OriginAuthFinal,
    info: OriginAuthInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default originAuth;
