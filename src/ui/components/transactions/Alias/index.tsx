import { Alias } from './Alias';
import { AliasCard } from './AliasCard';
import { AliasFinal } from './AliasFinal';
import * as utils from './parseTx';

const alias = {
    type: utils.messageType,
    message: Alias,
    card: AliasCard,
    final: AliasFinal,
    ...utils,
};

export default alias;
