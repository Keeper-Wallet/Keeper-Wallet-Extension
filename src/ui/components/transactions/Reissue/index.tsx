import { Reissue } from './Reissue';
import { ReissueCard } from './ReissueCard';
import { ReissueFinal } from './ReissueFinal';
import { ReissueInfo } from './ReissueInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: Reissue,
    card: ReissueCard,
    final: ReissueFinal,
    info: ReissueInfo,
    ...utils,
};

export default transfer;
