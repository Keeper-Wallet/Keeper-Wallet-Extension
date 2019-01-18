import { Alias } from './Alias';
import { AliasCard } from './AliasCard';
import { AliasFinal } from './AliasFinal';
import { AliasInfo } from './AliasInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const alias = {
    type: messageType,
    message: Alias,
    card: AliasCard,
    final: AliasFinal,
    info: AliasInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default alias;
