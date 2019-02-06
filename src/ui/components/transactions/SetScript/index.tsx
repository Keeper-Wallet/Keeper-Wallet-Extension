import { SetScript } from './SetScript';
import { SetScriptCard } from './SetScriptCard';
import { SetScriptFinal } from './SetScriptFinal';
import { SetScriptInfo } from './SetScriptInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: SetScript,
    card: SetScriptCard,
    final: SetScriptFinal,
    info: SetScriptInfo,
    ...utils,
};

export default transfer;
