import {
  duckColors,
  duckGenerationNames,
  duckNames,
} from 'nfts/ducks/constants';
import { AssetDetail } from 'ui/services/Background';

interface DuckInfo {
  genoType: string;
  generation: string;
  generationName: string;
  name: string;
  color: string;
  bgColor: string;
  bgImage: string;
  fgImage: string;
}

export function getNftInfo(nft: AssetDetail): DuckInfo | null {
  if (!nft.id) {
    return null;
  }

  const [, genoType, generationColor] = nft.name.split('-');
  const generation = generationColor[0];
  const generationName = duckGenerationNames[generation] ?? generation;
  const name = duckNames[genoType]
    ? duckNames[genoType].name
    : generateName(genoType);
  const color = generationColor[1];
  const bgColor = color && `#${duckColors[color]}`;
  const bgImage =
    genoType === 'WWWWLUCK' &&
    'url("https://wavesducks.com/ducks/pokras-background.svg")';
  const fgImage = `https://wavesducks.com/api/v1/ducks/${genoType}.svg?color=${color}`;

  return {
    genoType,
    generation,
    generationName,
    name,
    color,
    bgColor,
    bgImage,
    fgImage,
  };
}

function generateName(genotype: string): string {
  const name = genotype
    .split('')
    .map((gene, index) => duckNames[gene]?.[index])
    .join('')
    .toLowerCase();
  return name.charAt(0).toUpperCase() + name.substring(1, name.length);
}
