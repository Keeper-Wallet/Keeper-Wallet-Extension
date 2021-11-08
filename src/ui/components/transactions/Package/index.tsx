import { Package } from './Package';
import { PackageCard } from './PackageCard';
import { PackageFinal } from './PackageFinal';
import * as utils from './parseTx';

const transfer = {
  type: utils.messageType,
  message: Package,
  card: PackageCard,
  final: PackageFinal,
  ...utils,
};

export default transfer;
