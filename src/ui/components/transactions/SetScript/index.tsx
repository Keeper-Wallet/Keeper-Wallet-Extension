import { SetScript } from './SetScript';
import { SetScriptCard } from './SetScriptCard';
import { SetScriptFinal } from './SetScriptFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const setScript: MessageConfig = {
  type: utils.messageType,
  message: SetScript,
  card: SetScriptCard,
  final: SetScriptFinal,
  ...utils,
};

export default setScript;
