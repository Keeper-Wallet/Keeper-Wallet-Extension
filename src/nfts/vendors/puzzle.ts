import { type DataTransactionEntryString } from '@waves/ts-types/src/parts';

import {
  dataEntriesToRecord,
  fetchDataEntries,
} from '../../nodeApi/dataEntries';
import {
  type CreateParams,
  type FetchInfoParams,
  type Nft,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';

interface PuzzleNftInfo {
  id: string;
  vendor: NftVendorId.Puzzle;
  image: string;
  creator: string;
}

const PUZZLE_MARKET_DAPP = '3PFQjjDMiZKQZdu5JqTHD7HwgSXyp9Rw9By';

function nftPropertyKey(id: string, property: string) {
  return `nft_${id}_${property}`;
}

export class PuzzleNftVendor implements NftVendor<PuzzleNftInfo> {
  id = NftVendorId.Puzzle as const;

  is(nft: NftAssetDetail): boolean {
    return nft.issuer === PUZZLE_MARKET_DAPP;
  }

  fetchInfo({ nfts, nodeUrl }: FetchInfoParams) {
    if (nfts.length === 0) {
      return [];
    }

    const nftIds = nfts.map(nft => nft.assetId);

    return fetchDataEntries<DataTransactionEntryString>({
      nodeUrl,
      address: PUZZLE_MARKET_DAPP,
      keys: nftIds.flatMap(id => [
        nftPropertyKey(id, 'image'),
        nftPropertyKey(id, 'issuer'),
      ]),
    })
      .then(dataEntriesToRecord)
      .then(artworksEntries => {
        return nftIds.map((id): PuzzleNftInfo => {
          const creator = artworksEntries[nftPropertyKey(id, 'issuer')];
          const image = artworksEntries[nftPropertyKey(id, 'image')];

          return {
            id,
            vendor: NftVendorId.Puzzle,
            creator,
            image,
          };
        }, []);
      });
  }

  create(params: CreateParams<PuzzleNftInfo>): Nft {
    return {
      creator: params.info.creator,
      creatorUrl: `https://puzzlemarket.org/address/${params.info.creator}`,
      displayCreator: params.info.creator,
      description: params.asset.description,
      displayName: params.asset.displayName,
      foreground: params.info.image,
      id: params.info.id,
      marketplaceUrl: `https://puzzlemarket.org/nft/${params.info.id}`,
      name: params.asset.name,
      vendor: NftVendorId.Puzzle,
    };
  }
}
