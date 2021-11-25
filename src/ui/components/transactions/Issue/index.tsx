import { Issue } from './Issue';
import { IssueCard } from './IssueCard';
import { IssueFinal } from './IssueFinal';
import * as utils from './parseTx';

const issue = {
  type: utils.messageType,
  message: Issue,
  card: IssueCard,
  final: IssueFinal,
  ...utils,
};

export default issue;
