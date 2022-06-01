import {
  duckColors,
  duckGenerationNames,
  duckNames,
  ducksDApps,
} from 'nfts/ducks/constants';
import { NftDetails } from 'controllers/NftInfoController';
import { NFT } from 'nfts/utils';

export interface DuckInfo {
  id: string;
  vendor: NFT.Ducks;
  creator: string;
  genoType: string;
  generation: string;
  generationName: string;
  name: string;
  color: string;
  bgColor: string;
  bgImage: string;
  fgImage: string;
}

export async function fetchAllDucks(nfts: NftDetails[]): Promise<DuckInfo[]> {
  if (nfts.length === 0) {
    return [];
  }
  return Promise.all(
    nfts.map(async (nft): Promise<DuckInfo | null> => {
      if (!nft?.assetId || !ducksDApps.includes(nft?.issuer)) {
        return null;
      }

      const [, genoType, generationColor] = nft.name.split('-');
      const generation = generationColor[0];
      const generationName = getGenerationName(generation);
      const name = getName(genoType);
      const color = generationColor[1];
      const bgColor = color && `#${duckColors[color]}`;
      const bgImage =
        genoType === 'WWWWLUCK' &&
        'url("https://wavesducks.com/ducks/pokras-background.svg")';
      const hasDruckGenes = genoType.indexOf('I') !== -1;
      const druck = hasDruckGenes
        ? assetIdAsFloat(nft.assetId) > 0.5
          ? '1'
          : '2'
        : null;
      const fgImage = `${genoType}.svg?color=${color}&druck=${druck}`;

      return {
        id: nft.assetId,
        vendor: NFT.Ducks,
        creator: nft.issuer,
        genoType,
        generation,
        generationName,
        name,
        color,
        bgColor,
        bgImage,
        fgImage,
      };
    })
  );
}

function getGenerationName(generation: string): string {
  return duckGenerationNames[generation] ?? generation;
}

function getName(genoType: string): string {
  return duckNames[genoType]
    ? duckNames[genoType].name
    : generateName(genoType);
}

function generateName(genotype: string): string {
  const name = genotype
    .split('')
    .map((gene, index) => duckNames[gene]?.[index])
    .join('')
    .toLowerCase();
  return name.charAt(0).toUpperCase() + name.substring(1, name.length);
}

function assetIdAsFloat(assetId: string): number {
  let i = 0;
  let hash = 0;
  if (!assetId) return 0;
  while (i < assetId.length)
    hash = (hash << 5) + hash + assetId.charCodeAt(i++);

  return Math.abs(((hash * 10) % 0x7fffffff) / 0x7fffffff);
}
