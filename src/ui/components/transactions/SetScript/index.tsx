import { SetScript } from './SetScript';
import { SetScriptCard } from './SetScriptCard';
import { SetScriptFinal } from './SetScriptFinal';
import { SetScriptInfo } from './SetScriptInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: SetScript,
    card: SetScriptCard,
    final: SetScriptFinal,
    info: SetScriptInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
