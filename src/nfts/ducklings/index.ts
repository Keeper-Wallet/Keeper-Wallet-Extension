import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import {
  DucklingAdjectives,
  ducklingsApiUrl,
  DucklingsDescription,
} from 'nfts/ducklings/constants';

export interface DucklingInfo extends BaseInfo {
  vendor: NftVendor.Ducklings;
  growthLevel: number;
}

export class Duckling extends BaseNft<DucklingInfo> {
  get displayCreator() {
    return 'Ducklings';
  }

  get displayName() {
    const indexes = [16, 10, 1, 9, 9, 7];
    const indexes2 = [10, 4, 2, 0, 2, 1];

    const adjNumber = indexes.reduce(
      (acc, index) => acc + this.id.charCodeAt(index),
      0
    );

    const nameNumber = indexes2.reduce(
      (acc, index) => acc + this.id.charCodeAt(index),
      0
    );

    const adj = DucklingAdjectives[adjNumber % DucklingAdjectives.length];
    const ducklingNames = Object.keys(DucklingsDescription);
    const name = ducklingNames[nameNumber % ducklingNames.length];

    return `${capitalize(adj)} ${capitalize(name)}`;
  }

  get foreground() {
    let fileIndex = Math.trunc(this.info.growthLevel / 25);
    fileIndex = fileIndex < 4 ? fileIndex : 3;
    return ducklingsApiUrl + `duckling-${fileIndex}.svg`;
  }
}

function capitalize(str: string): string {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}
