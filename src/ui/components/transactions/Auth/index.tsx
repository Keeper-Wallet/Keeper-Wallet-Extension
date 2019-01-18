import { Auth } from './Auth';
import { AuthCard } from './AuthCard';
import { AuthFinal } from './AuthFinal';
import { AuthInfo } from './AuthInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const auth = {
    type: messageType,
    message: Auth,
    card: AuthCard,
    final: AuthFinal,
    info: AuthInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe
};

export default auth;
