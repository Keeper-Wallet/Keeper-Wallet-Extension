import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { UpdateAssetInfo } from './UpdateAssetInfo';
import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoFinal } from './UpdateAssetInfoFinal';

const updateAssetInfo: MessageConfig = {
  type: utils.messageType,
  message: UpdateAssetInfo,
  card: UpdateAssetInfoCard,
  final: UpdateAssetInfoFinal,
  ...utils,
};

export default updateAssetInfo;
