import { Package } from './Package';
import { PackageCard } from './PackageCard';
import { PackageFinal } from './PackageFinal';
import { PackageInfo } from './PackageInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: Package,
    card: PackageCard,
    final: PackageFinal,
    info: PackageInfo,
    ...utils,
};

export default transfer;
