import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import { capitalize } from 'nfts/utils';
import {
  DucklingAdjectives,
  DucklingsDescription,
} from 'nfts/ducklings/constants';
import * as React from 'react';

export interface DucklingInfo extends BaseInfo {
  vendor: NftVendor.Ducklings;
  growthLevel: number;
}

export class Duckling extends BaseNft<DucklingInfo> {
  private get adj(): string {
    const indexes = [16, 10, 1, 9, 9, 7];
    const adjNumber = indexes.reduce(
      (acc, index) => acc + this.id.charCodeAt(index),
      0
    );

    return DucklingAdjectives[adjNumber % DucklingAdjectives.length];
  }

  private get name_(): string {
    const indexes2 = [10, 4, 2, 0, 2, 1];
    const nameNumber = indexes2.reduce(
      (acc, index) => acc + this.id.charCodeAt(index),
      0
    );
    const ducklingNames = Object.keys(DucklingsDescription);
    return ducklingNames[nameNumber % ducklingNames.length];
  }

  get displayCreator(): string {
    return 'Ducklings';
  }

  get displayName(): string {
    return `${capitalize(this.adj)} ${capitalize(this.name_)}`;
  }

  get marketplaceUrl(): string {
    return `https://wavesducks.com/duckling/${this.id}`;
  }

  get description(): string {
    return DucklingsDescription[this.name_];
  }

  get background(): React.CSSProperties {
    return { backgroundColor: '#f0e7d5' };
  }

  get foreground() {
    if (!this.info) {
      return null;
    }

    let fileIndex = Math.trunc(this.info.growthLevel / 25);
    fileIndex = fileIndex < 4 ? fileIndex : 3;
    return `https://wavesducks.com/ducks/ducklings/duckling-${fileIndex}.svg`;
  }
}
