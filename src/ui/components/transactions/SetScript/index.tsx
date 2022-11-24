import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { SetScript } from './SetScript';
import { SetScriptCard } from './SetScriptCard';
import { SetScriptFinal } from './SetScriptFinal';

const setScript: MessageConfig = {
  type: utils.messageType,
  message: SetScript,
  card: SetScriptCard,
  final: SetScriptFinal,
  ...utils,
};

export default setScript;
