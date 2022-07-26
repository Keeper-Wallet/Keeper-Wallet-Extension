import { Reissue } from './Reissue';
import { ReissueCard } from './ReissueCard';
import { ReissueFinal } from './ReissueFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const reissue: MessageConfig = {
  type: utils.messageType,
  message: Reissue,
  card: ReissueCard,
  final: ReissueFinal,
  ...utils,
};

export default reissue;
