import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import {
  ArtefactNames,
  ducksArtefactApiUrl,
} from 'nfts/duckArtifacts/constants';

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

  get foreground(): string {
    return ducksArtefactApiUrl + `${this.asset.name}.svg`;
  }
}
