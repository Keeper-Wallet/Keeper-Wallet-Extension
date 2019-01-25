import { AssetScript } from './AssetScript';
import { AssetScriptCard } from './AssetScriptCard';
import { AssetScriptFinal } from './AssetScriptFinal';
import { AssetScriptInfo } from './AssetScriptInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: AssetScript,
    card: AssetScriptCard,
    final: AssetScriptFinal,
    info: AssetScriptInfo,
    ...utils,
};

export default transfer;
