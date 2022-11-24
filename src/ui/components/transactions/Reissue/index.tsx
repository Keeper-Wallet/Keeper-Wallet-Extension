import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { Reissue } from './Reissue';
import { ReissueCard } from './ReissueCard';
import { ReissueFinal } from './ReissueFinal';

const reissue: MessageConfig = {
  type: utils.messageType,
  message: Reissue,
  card: ReissueCard,
  final: ReissueFinal,
  ...utils,
};

export default reissue;
