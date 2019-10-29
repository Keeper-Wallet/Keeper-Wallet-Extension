import { WavesAuth } from './WavesAuth';
import { WavesAuthCard } from './WavesAuthCard';
import { WavesAuthFinal } from './WavesAuthFinal';
import { WavesAuthInfo } from './WavesAuthInfo';
import * as utils from './parseTx';

const wavesAuth = {
    type: utils.messageType,
    message: WavesAuth,
    card: WavesAuthCard,
    final: WavesAuthFinal,
    info: WavesAuthInfo,
    ...utils,
};

export default wavesAuth;
