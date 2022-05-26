import {
  duckColors,
  duckGenerationNames,
  duckNames,
  ducksDApps,
} from 'nfts/ducks/constants';
import { AssetDetail } from 'ui/services/Background';

export interface DuckInfo {
  id: string;
  genoType: string;
  generation: string;
  generationName: string;
  name: string;
  color: string;
  bgColor: string;
  bgImage: string;
  fgImage: string;
}

export async function fetchAllDucks(nfts: AssetDetail[]): Promise<DuckInfo[]> {
  if (nfts.length === 0) {
    return [];
  }
  return Promise.all(nfts.map(fetchDuck));
}

export async function fetchDuck(nft: AssetDetail): Promise<DuckInfo | null> {
  if (!nft?.id || !ducksDApps.includes(nft?.issuer)) {
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
  const fgImage = `${genoType}.svg?color=${color}`;

  return {
    id: nft.id,
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
