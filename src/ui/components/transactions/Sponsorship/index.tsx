import { Sponsorship } from './Sponsorship';
import { SponsorshipCard } from './SponsorshipCard';
import { SponsorshipFinal } from './SponsorshipFinal';
import { SponsorshipInfo } from './SponsorshipInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: Sponsorship,
    card: SponsorshipCard,
    final: SponsorshipFinal,
    info: SponsorshipInfo,
    ...utils,
};

export default transfer;
