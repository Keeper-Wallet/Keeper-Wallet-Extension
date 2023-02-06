import {
  type CreateParams,
  type FetchInfoParams,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';

const DUCKS_ARTEFACTS_DAPP = '3P5E9xamcWoymiqLx8ZdmR7o4fJSRMGp1WR';

interface DucksArtefactsNftInfo {
  id: string;
  vendor: NftVendorId.DucksArtefact;
}

export class DucksArtefactsNftVendor
  implements NftVendor<DucksArtefactsNftInfo>
{
  id = NftVendorId.DucksArtefact as const;

  is(nft: NftAssetDetail) {
    return nft.issuer === DUCKS_ARTEFACTS_DAPP;
  }

  fetchInfo({ nfts }: FetchInfoParams) {
    return nfts.map(
      (nft): DucksArtefactsNftInfo => ({
        id: nft.assetId,
        vendor: NftVendorId.DucksArtefact,
      })
    );
  }

  create({ asset }: CreateParams<DucksArtefactsNftInfo>) {
    const name = asset.name.toLowerCase().replace(/-/, '_');

    return {
      background: { backgroundColor: '#e6d4ef' },
      creator: asset.issuer,
      description: DUCK_ARTEFACTS_INFO[name]?.description,
      displayCreator: 'Ducks Artefacts',
      displayName: DUCK_ARTEFACTS_INFO[name]?.title || asset.name,
      foreground: `https://wavesducks.com/api/v1/images/${asset.name}.svg`,
      id: asset.id,
      marketplaceUrl: `https://wavesducks.com/item/${asset.id}`,
      name: asset.name,
      vendor: NftVendorId.DucksArtefact,
    };
  }
}

const DUCK_ARTEFACTS_INFO: Partial<
  Record<string, { title: string; description: string }>
> = {
  art_lake: {
    title: 'Lake',
    description:
      '+2% to the productivity of all ducks on the farm. Can be toggled on or off.',
  },
  art_house: {
    title: 'Duck House',
    description:
      'This artefact allows you to boost the productivity of 4 selected ducks by 30%',
  },
  art_bighouse: {
    title: 'Mega Duck House',
    description:
      'This artefact not only will boost the productivity of 10 ducks by 15% but will also serve as 10 free perches.',
  },
  art_fixgene: {
    title: 'Breeding Vaccine',
    description:
      "Allows you to manually select which parent's gene will be selected for a given trait when breeding. Single-use.",
  },
  art_freegene: {
    title: 'Lost Duck Gene',
    description:
      'When breeding, add a random gene of a genesis duck that can no longer be hatched. Single-use.',
  },
  art_mirror: {
    title: 'Splitting Mirror',
    description:
      'Single-use\n\nCreate an exact copy of any duck older than the Genesis generation. It gets a new number, refreshed achievements and drops the initial rarity. Cannot be used on Genesis ducks or Jackpots.',
  },
  art_customduck: {
    title: 'Custom Jackpot Duck',
    description:
      'We will design a duck according to your portrait or other provided references. Your custom duck will have a status of jackpot and a 100% rarity.',
  },
  art_pomp: {
    title: 'Pompadour',
    description:
      'Single-use\n\nReplaces a hair gene of a chosen duck and can give it up to 100% rarity. The duck gets a new number and refreshed achievements. Can be used only on sterile ducks. Cannot be used on Genesis ducks or Jackpots.',
  },
  art_cape: {
    title: 'Magic Cape',
    description:
      'Can be worn by a duck. Looks enchanted but has no magic powers.',
  },
  art_hat: {
    title: 'Quacker Hat',
    description:
      'Can be worn by a duck. Driver’s life is a harsh one but at least you’ve got a fancy duck.',
  },
  art_xmistl: {
    title: 'Mistletoe',
    description: 'Reusable\n\nGives 10% discount on perches of all colors.',
  },
  art_xhat: {
    title: 'X-mas Hat',
    description:
      'Single-use\n\nAdds a new unique gene to your duck and can give it a rarity up to 100%. Gives a special card in Duck Wars. The duck also gets a new number and refreshed achievements. Can be used only on sterile ducks. Cannot be used on Genesis ducks or Jackpots.',
  },
  art_xscarf: {
    title: 'X-mas Scarf',
    description: '+69% to a farming power of one duck',
  },
  art_xsweater: {
    title: 'X-mas Sweater',
    description:
      'Put on a duck on farming and it will be able to farm and take part in the Duck Wars simultaneously',
  },
  art_xsock: {
    title: 'X-mas Sock',
    description:
      'Earned duckling feed limit is increased by 200%. Can be toggled on or off.',
  },
  art_xtree: {
    title: 'X-mas Tree',
    description:
      '+3% to the productivity of all ducks on the farm. Can be toggled on or off.',
  },
};
