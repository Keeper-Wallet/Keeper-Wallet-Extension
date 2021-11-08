import { SetScript } from './SetScript';
import { SetScriptCard } from './SetScriptCard';
import { SetScriptFinal } from './SetScriptFinal';
import * as utils from './parseTx';

const transfer = {
  type: utils.messageType,
  message: SetScript,
  card: SetScriptCard,
  final: SetScriptFinal,
  ...utils,
};

export default transfer;
