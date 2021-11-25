import { Sponsorship } from './Sponsorship';
import { SponsorshipCard } from './SponsorshipCard';
import { SponsorshipFinal } from './SponsorshipFinal';
import * as utils from './parseTx';

const sponsorShip = {
  type: utils.messageType,
  message: Sponsorship,
  card: SponsorshipCard,
  final: SponsorshipFinal,
  ...utils,
};

export default sponsorShip;
