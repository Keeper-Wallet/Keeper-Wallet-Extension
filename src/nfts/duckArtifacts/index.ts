import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import { ArtefactNames } from 'nfts/duckArtifacts/constants';
import * as React from 'react';

export interface DucksArtefactInfo extends BaseInfo {
  vendor: NftVendor.DucksArtefact;
}

export class DucksArtefact extends BaseNft<DucksArtefactInfo> {
  private get name_(): string {
    return this.asset.name.toLowerCase().replace(/-/, '_');
  }

  get displayCreator(): string {
    return 'Ducks Artefacts';
  }

  get displayName(): string {
    return ArtefactNames[this.name_]?.title || this.asset.name;
  }

  get marketplaceUrl(): string {
    return `https://wavesducks.com/item/${this.id}`;
  }

  get description(): string {
    return ArtefactNames[this.name_]?.description;
  }

  get background(): React.CSSProperties {
    return { backgroundColor: '#e6d4ef' };
  }

  get foreground(): string {
    return `https://wavesducks.com/ducks/artefacts/${this.asset.name}.svg`;
  }
}
