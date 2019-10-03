import { CustomData } from './CustomData';
import { CustomDataCard } from './CustomDataCard';
import { CustomDataFinal } from './CustomDataFinal';
import { CustomDataInfo } from './CustomDataInfo';
import * as utils from './parseTx';

const customData = {
    type: utils.messageType,
    message: CustomData,
    card: CustomDataCard,
    final: CustomDataFinal,
    info: CustomDataInfo,
    ...utils,
};

export default customData;
