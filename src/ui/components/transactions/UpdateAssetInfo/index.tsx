import { UpdateAssetInfo } from './UpdateAssetInfo';
import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoFinal } from './UpdateAssetInfoFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const updateAssetInfo: MessageConfig = {
  type: utils.messageType,
  message: UpdateAssetInfo,
  card: UpdateAssetInfoCard,
  final: UpdateAssetInfoFinal,
  ...utils,
};

export default updateAssetInfo;
