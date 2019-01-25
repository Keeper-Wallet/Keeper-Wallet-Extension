import { Alias } from './Alias';
import { AliasCard } from './AliasCard';
import { AliasFinal } from './AliasFinal';
import { AliasInfo } from './AliasInfo';
import * as utils from './parseTx';

const alias = {
    type: utils.messageType,
    message: Alias,
    card: AliasCard,
    final: AliasFinal,
    info: AliasInfo,
    ...utils,
};

export default alias;
