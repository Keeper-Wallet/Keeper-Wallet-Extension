import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { Sponsorship } from './Sponsorship';
import { SponsorshipCard } from './SponsorshipCard';
import { SponsorshipFinal } from './SponsorshipFinal';

const sponsorShip: MessageConfig = {
  type: utils.messageType,
  message: Sponsorship,
  card: SponsorshipCard,
  final: SponsorshipFinal,
  ...utils,
};

export default sponsorShip;
