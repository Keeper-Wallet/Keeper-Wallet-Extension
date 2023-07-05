import {
  type CreateParams,
  type FetchInfoParams,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';
import { capitalize } from '../utils';

const DUCKS_DAPP_BREADER = '3PDVuU45H7Eh5dmtNbnRNRStGwULA7NY6Hb';
const DUCKS_DAPP_INCUBATOR = '3PEktVux2RhchSN63DsDo4b4mz4QqzKSeDv';
const DUCKS_DAPPS = [DUCKS_DAPP_BREADER, DUCKS_DAPP_INCUBATOR];

const displayCreatorByCreator: Record<string, string | undefined> = {
  [DUCKS_DAPP_BREADER]: 'Ducks Breeder',
  [DUCKS_DAPP_INCUBATOR]: 'Ducks Incubator',
};

interface DucksNftInfo {
  id: string;
  vendor: NftVendorId.Ducks;
}

function assetIdAsFloat(assetId: string): number {
  let i = 0;
  let hash = 0;
  if (!assetId) return 0;
  while (i < assetId.length)
    hash = (hash << 5) + hash + assetId.charCodeAt(i++);

  return Math.abs(((hash * 10) % 0x7fffffff) / 0x7fffffff);
}

export class DucksNftVendor implements NftVendor<DucksNftInfo> {
  id = NftVendorId.Ducks as const;

  is(nft: NftAssetDetail) {
    return DUCKS_DAPPS.includes(nft.issuer);
  }

  fetchInfo({ nfts }: FetchInfoParams) {
    return nfts.map(
      (nft): DucksNftInfo => ({
        id: nft.assetId,
        vendor: NftVendorId.Ducks,
      }),
    );
  }

  create({ asset }: CreateParams<DucksNftInfo>) {
    const [, genoType, generation] = asset.name.split('-');
    const duckNameEntry = DUCK_NAMES[genoType];

    return {
      background: {
        backgroundImage:
          genoType === 'WWWWLUCK'
            ? 'url("https://wavesducks.com/ducks/pokras-background.svg")'
            : undefined,
        backgroundColor: generation[1] && `#${DUCK_COLORS[generation[1]]}`,
      },

      creator: asset.issuer,
      displayCreator: displayCreatorByCreator[asset.issuer],

      displayName: `${capitalize(
        DUCK_GENERATION_NAMES[generation[0]] ?? generation[0],
      )} ${capitalize(
        duckNameEntry
          ? Array.isArray(duckNameEntry)
            ? undefined
            : duckNameEntry.name
          : genoType
              .split('')
              .map((gene, index) => {
                const genes = DUCK_NAMES[gene];

                return Array.isArray(genes) ? genes[index] : undefined;
              })
              .join('')
              .toLowerCase(),
      )}`,

      foreground:
        `https://wavesducks.com/api/v1/ducks/${genoType}.svg` +
        `?color=${generation[1]}` +
        `&druck=${
          genoType.indexOf('I') !== -1
            ? assetIdAsFloat(asset.id) > 0.5
              ? '1'
              : '2'
            : null
        }`,

      id: asset.id,
      marketplaceUrl: `https://wavesducks.com/duck/${asset.id}`,
      name: asset.name,
      vendor: NftVendorId.Ducks,
    };
  }
}

const DUCK_COLORS: Partial<Record<string, string>> = {
  B: 'ADD8E6',
  R: 'FFA07A',
  Y: 'F8EE9D',
  G: 'D9F6B3',
  U: 'CD6F86',
};

const DUCK_GENERATION_NAMES: Partial<Record<string, string>> = {
  H: 'Hero',
  I: 'Ideal',
  J: 'Jackpot',
  K: 'Knight',
  L: 'Lord',
  M: 'Magical',
  N: 'Natural',
  O: 'Obstinate',
  G: 'Genesis',
};

const DUCK_NAMES: Partial<
  Record<string, { name: string; unique?: boolean } | string[]>
> = {
  AAAAAAAA: { name: 'Elon' },
  BBBBBBBB: { name: 'Satoshi' },
  CCCCCCCC: { name: 'Doge' },
  DDDDDDDD: { name: 'Bogdanoff' },
  EEEEEEEE: { name: 'Chad' },
  FFFFFFFF: { name: 'Harold' },
  GGGGGGGG: { name: 'Pepe' },
  HHHHHHHH: { name: 'El Risitas' },
  IIIIIIII: { name: 'Druck' },
  KKKKKKKK: { name: 'Drama Queen' },
  WWWWWWWW: { name: 'Sasha', unique: true },
  WWWWWWWP: { name: 'Phoenix', unique: true },
  WWWWWWW1: { name: 'Joel Bad Crypto', unique: true },
  WWWWWWW2: { name: 'Travis Bad Crypto', unique: true },
  WWWWWWWM: { name: 'Mani', unique: true },
  WWWWWWWS: { name: 'Swop Punk', unique: true },
  WWWWWWWF: { name: 'Forklog', unique: true },
  WWWWSXSR: { name: 'Spencer X', unique: true },
  WWWWWSX2: { name: 'BABY BOOMER', unique: true },
  WWWWWSX3: { name: 'Spencer Z', unique: true },
  WWWWWSX4: { name: 'Spencer Y', unique: true },
  WWWWLUCK: { name: 'LUCK & WISDOM', unique: true },
  WWWWWYAN: { name: 'Petr Yan', unique: true },
  WWWWHELL: { name: 'Deaduck', unique: true },
  WWWSQUID: { name: 'DuckSquid', unique: true },
  WWWNACHO: { name: 'Nacho', unique: true },
  WWWWWASH: { name: 'Punk Ash', unique: true },
  WWWWVOVA: { name: 'Vladimir Zhuravlev', unique: true },
  WWWWRIKY: { name: 'Riky', unique: true },
  WWTURTLE: { name: 'Black Turtle', unique: true },
  WWSPORTY: { name: 'Sporty Duck', unique: true },
  WWWWANNA: { name: 'Anna Nifontova ', unique: true },
  WWWIGNAT: { name: 'Ignat Golovatyuk', unique: true },
  WWWWBALL: { name: 'Quarterduck', unique: true },
  WWWCUPID: { name: 'Cupiduck', unique: true },
  WWWDAISY: { name: 'Daisy', unique: true },
  WWWWMARG: { name: 'Margaret Hamilton', unique: true },
  WWZETKIN: { name: 'Clara Zetkin', unique: true },
  WWJOSEPH: { name: 'Joseph Madara', unique: true },
  WWWDASHA: { name: 'Dasha The Queen ❤️', unique: true },
  WAWWDIMA: { name: 'Dima Ivanov', unique: true },
  WWWAVTWO: { name: 'Muscle Doge', unique: true },
  WWWBVTWO: { name: 'Muscle Doge', unique: true },
  WWWCVTWO: { name: 'Muscle Doge', unique: true },
  WWWDVTWO: { name: 'Muscle Doge', unique: true },
  WWWEVTWO: { name: 'Muscle Doge', unique: true },
  WWWFVTWO: { name: 'Muscle Doge', unique: true },
  WWWGVTWO: { name: 'Muscle Doge', unique: true },
  WWWHVTWO: { name: 'Muscle Doge', unique: true },
  WWWIVTWO: { name: 'Muscle Doge', unique: true },
  WWWJVTWO: { name: 'Muscle Doge', unique: true },
  WWAMAHER: { name: 'Maher Coleman', unique: true },
  WWBMAHER: { name: 'Maher Coleman', unique: true },
  WWCMAHER: { name: 'Maher Coleman', unique: true },
  WWDMAHER: { name: 'Maher Coleman', unique: true },
  WWEMAHER: { name: 'Maher Coleman', unique: true },
  WWFMAHER: { name: 'Maher Coleman', unique: true },
  WWGMAHER: { name: 'Maher Coleman', unique: true },
  WWHMAHER: { name: 'Maher Coleman', unique: true },
  WWIMAHER: { name: 'Maher Coleman', unique: true },
  WWPUZZLE: { name: 'Puzzle Duck', unique: true },
  A: ['e', 'l', 'o', 'n', 'n', 'o', 'l', 'e'],
  B: ['s', 'a', 't', 'o', 's', 'h', 'i', 't'],
  C: ['d', 'o', 'g', 'e', 'e', 'g', 'o', 'd'],
  D: ['b', 'o', 'g', 'd', 'a', 'n', 'o', 'f'],
  E: ['c', 'h', 'a', 'd', 'a', 'd', 'c', 'h'],
  F: ['h', 'a', 'r', 'o', 'l', 'd', '', ''],
  G: ['p', 'e', 'p', 'e', 'p', 'e', 'p', 'e'],
  H: ['e', 'l', ' ', 'r', 'i', 's', 'i', 'tas'],
  I: ['d', 'r', 'u', 'c', 'k', 'j', 'e', 'nya'],
  K: ['dr', 'a', 'm', 'a', ' ', 'q', 'ue', 'en'],
  S: ['Cool '],
  T: ['Xmax '],
  W: ['S', 'a', 's', 'h', 'a', 'g', 'o', 'd'],
};
