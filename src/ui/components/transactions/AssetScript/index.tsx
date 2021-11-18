import { AssetScript } from './AssetScript';
import { AssetScriptCard } from './AssetScriptCard';
import { AssetScriptFinal } from './AssetScriptFinal';
import * as utils from './parseTx';

const assetScript = {
  type: utils.messageType,
  message: AssetScript,
  card: AssetScriptCard,
  final: AssetScriptFinal,
  ...utils,
};

export default assetScript;
