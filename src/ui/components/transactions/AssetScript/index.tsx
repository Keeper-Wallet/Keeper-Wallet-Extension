import { AssetScript } from './AssetScript';
import { AssetScriptCard } from './AssetScriptCard';
import { AssetScriptFinal } from './AssetScriptFinal';
import { AssetScriptInfo } from './AssetScriptInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: AssetScript,
    card: AssetScriptCard,
    final: AssetScriptFinal,
    info: AssetScriptInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
