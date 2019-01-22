import { Reissue } from './Reissue';
import { ReissueCard } from './ReissueCard';
import { ReissueFinal } from './ReissueFinal';
import { ReissueInfo } from './ReissueInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: Reissue,
    card: ReissueCard,
    final: ReissueFinal,
    info: ReissueInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
