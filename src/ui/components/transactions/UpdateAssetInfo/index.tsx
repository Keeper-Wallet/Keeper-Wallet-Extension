import { UpdateAssetInfo } from './UpdateAssetInfo';
import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoFinal } from './UpdateAssetInfoFinal';
import * as utils from './parseTx';

const transfer = {
  type: utils.messageType,
  message: UpdateAssetInfo,
  card: UpdateAssetInfoCard,
  final: UpdateAssetInfoFinal,
  ...utils,
};

export default transfer;
