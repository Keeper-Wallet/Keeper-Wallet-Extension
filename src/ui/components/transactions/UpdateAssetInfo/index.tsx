import { UpdateAssetInfo } from './UpdateAssetInfo';
import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoFinal } from './UpdateAssetInfoFinal';
import { UpdateAssetInfoInfo } from './UpdateAssetInfoInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: UpdateAssetInfo,
    card: UpdateAssetInfoCard,
    final: UpdateAssetInfoFinal,
    info: UpdateAssetInfoInfo,
    ...utils,
};

export default transfer;
