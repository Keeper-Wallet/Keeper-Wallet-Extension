import { MessageConfig } from '../types';
import { Issue } from './Issue';
import { IssueCard } from './IssueCard';
import { IssueFinal } from './IssueFinal';
import * as utils from './parseTx';

const issue: MessageConfig = {
  type: utils.messageType,
  message: Issue,
  card: IssueCard,
  final: IssueFinal,
  ...utils,
};

export default issue;
