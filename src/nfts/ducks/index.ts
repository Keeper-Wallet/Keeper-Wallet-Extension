import { BaseNft } from 'nfts/index';
import { capitalize } from 'nfts/utils';
import { DuckInfo } from 'nfts/ducks/utils';
import {
  duckColors,
  duckGenerationNames,
  duckNames,
  ducksApiUrl,
  ducksDAppBreeder,
  ducksDAppIncubator,
} from 'nfts/ducks/constants';
import { AssetDetail } from 'ui/services/Background';
import * as React from 'react';

export class Duck extends BaseNft<DuckInfo> {
  protected genoType: string;
  protected generationColor: string;
  protected druck: string;

  constructor(asset: AssetDetail, info: DuckInfo) {
    super(asset, info);

    const [, genoType, generationColor] = this.name.split('-');
    this.genoType = genoType;
    this.generationColor = generationColor;

    const hasDruckGenes = genoType.indexOf('I') !== -1;
    this.druck = hasDruckGenes
      ? assetIdAsFloat(this.id) > 0.5
        ? '1'
        : '2'
      : null;
  }

  get displayCreator() {
    switch (this.creator) {
      case ducksDAppBreeder:
        return 'Ducks Breeder';
      case ducksDAppIncubator:
        return 'Ducks Incubator';
    }
  }

  get displayName() {
    const name = duckNames[this.genoType]
      ? duckNames[this.genoType].name
      : this.genoType
          .split('')
          .map((gene, index) => duckNames[gene]?.[index])
          .join('')
          .toLowerCase();

    const generation = this.generationColor[0];
    const generationName = duckGenerationNames[generation] ?? generation;

    return `${capitalize(generationName)} ${capitalize(name)}`;
  }

  get foreground(): string {
    return (
      ducksApiUrl +
      `${this.genoType}.svg?color=${this.generationColor[1]}&druck=${this.druck}`
    );
  }

  get background(): React.CSSProperties {
    return {
      backgroundImage:
        this.genoType === 'WWWWLUCK' &&
        'url("https://wavesducks.com/ducks/pokras-background.svg")',
      backgroundColor:
        this.generationColor[1] && `#${duckColors[this.generationColor[1]]}`,
    };
  }
}

function assetIdAsFloat(assetId: string): number {
  let i = 0;
  let hash = 0;
  if (!assetId) return 0;
  while (i < assetId.length)
    hash = (hash << 5) + hash + assetId.charCodeAt(i++);

  return Math.abs(((hash * 10) % 0x7fffffff) / 0x7fffffff);
}
