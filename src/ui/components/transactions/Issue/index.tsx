import { Issue } from './Issue';
import { IssueCard } from './IssueCard';
import { IssueFinal } from './IssueFinal';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: Issue,
    card: IssueCard,
    final: IssueFinal,
    ...utils,
};

export default transfer;
