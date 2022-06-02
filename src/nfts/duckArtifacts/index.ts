import { BaseInfo, BaseNft, NftVendor } from 'nfts/index';
import {
  ArtefactNames,
  ducksArtefactApiUrl,
} from 'nfts/duckArtifacts/constants';

export interface DucksArtefactInfo extends BaseInfo {
  vendor: NftVendor.DucksArtefact;
}

export class DucksArtefact extends BaseNft<DucksArtefactInfo> {
  get displayCreator(): string {
    return 'Ducks Artefacts';
  }

  get displayName(): string {
    return (
      ArtefactNames[this.asset.name.toLowerCase().replace(/-/, '_')]?.title ||
      this.asset.name
    );
  }

  get foreground(): string {
    return ducksArtefactApiUrl + `${this.asset.name}.svg`;
  }
}
