import { Issue } from './Issue';
import { IssueCard } from './IssueCard';
import { IssueFinal } from './IssueFinal';
import { IssueInfo } from './IssueInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: Issue,
    card: IssueCard,
    final: IssueFinal,
    info: IssueInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
