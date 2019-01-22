import { Sponsorship } from './Sponsorship';
import { SponsorshipCard } from './SponsorshipCard';
import { SponsorshipFinal } from './SponsorshipFinal';
import { SponsorshipInfo } from './SponsorshipInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: Sponsorship,
    card: SponsorshipCard,
    final: SponsorshipFinal,
    info: SponsorshipInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
