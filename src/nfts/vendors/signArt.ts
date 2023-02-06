import { type DataTransactionEntryString } from '@waves/ts-types/src/parts';
import invariant from 'tiny-invariant';

import {
  dataEntriesToRecord,
  fetchDataEntries,
} from '../../nodeApi/dataEntries';
import {
  type CreateParams,
  type FetchInfoParams,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';

const SIGN_ART_DAPP = '3PDBLdsUrcsiPxNbt8g2gQVoefKgzt3kJzV';
const SIGN_ART_USER_DAPP = '3PGSWDgad4RtceQYXBpq2x73mXLRJYLRqRP';

interface SignArtNftInfo {
  artworkId: string;
  cid: string;
  creator: string;
  description: string;
  id: string;
  name: string;
  userName: string;
  vendor: NftVendorId.SignArt;
}

function nftIdKey(id: string) {
  return `nft_${id}`;
}

export class SignArtNftVendor implements NftVendor<SignArtNftInfo> {
  id = NftVendorId.SignArt as const;

  is(nft: NftAssetDetail) {
    return nft.issuer === SIGN_ART_DAPP;
  }

  fetchInfo({ nfts, nodeUrl }: FetchInfoParams) {
    if (nfts.length === 0) {
      return [];
    }

    const nftIds = nfts.map(nft => nft.assetId);

    return fetchDataEntries<DataTransactionEntryString>({
      nodeUrl,
      address: SIGN_ART_DAPP,
      keys: nftIds.map(id => nftIdKey(id)),
    })
      .then(dataEntriesToRecord)
      .then(dataEntries =>
        nftIds.map(id => {
          const value = dataEntries[nftIdKey(id)];

          const match = value.match(/art_sold_\d+_of_\d+_(\w+)_(\w+)/i);
          invariant(match);
          const [, artworkId, creator] = match;

          return { artworkId, creator };
        })
      )
      .then(artworks =>
        Promise.all([
          fetchDataEntries<DataTransactionEntryString>({
            nodeUrl,
            address: SIGN_ART_DAPP,
            keys: nftIds.flatMap((id, index) => {
              const info = artworks[index];
              return [
                `art_name_${info.artworkId}_${info.creator}`,
                `art_desc_${info.artworkId}_${info.creator}`,
                `art_display_cid_${info.artworkId}_${info.creator}`,
                `art_type_${info.artworkId}_${info.creator}`,
              ];
            }),
          }),

          fetchDataEntries<DataTransactionEntryString>({
            nodeUrl,
            address: SIGN_ART_USER_DAPP,
            keys: nftIds.map((id, index) => {
              const info = artworks[index];
              return `user_name_${info.creator}`;
            }),
          }),
        ])
      )
      .then(([artworksEntries, userNameEntries]) =>
        nftIds.map((id, index): SignArtNftInfo => {
          const entriesPerAsset = 4;
          const artName = artworksEntries[entriesPerAsset * index];
          const artDesc = artworksEntries[entriesPerAsset * index + 1];
          const artDisplayCid = artworksEntries[entriesPerAsset * index + 2];
          const userName = userNameEntries[index];
          const match = artName.key.match(/art_name_(\w+)_(\w+)/i);
          invariant(match);
          const [, artworkId, creator] = match;

          return {
            id,
            vendor: NftVendorId.SignArt,
            creator,
            userName: userName.value,
            name: artName.value,
            description: artDesc.value,
            artworkId,
            cid: artDisplayCid.value,
          };
        }, [])
      );
  }

  create({ asset, config, info }: CreateParams<SignArtNftInfo>) {
    const creator = info
      ? info.creator
      : asset.description.match(/creator: (\w+)/i)?.[1];

    const artworkId = info
      ? info.artworkId
      : asset.description?.match(/artid: (\w+)/i)?.[1];

    let foreground: string | undefined;

    if (info?.cid) {
      const [domain, filename] = info.cid.split('/');

      foreground = config.signArtImgUrl
        .replace(/{domain}/g, domain)
        .replace(/{filename}/g, filename);
    }

    return {
      creator,
      creatorUrl: creator && `https://mainnet.sign-art.app/user/${creator}`,
      description: info?.description ?? asset.description,
      displayCreator: info?.userName ? `@${info.userName}` : creator,
      displayName: info?.name ?? asset.displayName,
      foreground,
      id: asset.id,

      marketplaceUrl:
        creator &&
        artworkId &&
        `https://mainnet.sign-art.app/user/${creator}/artwork/${artworkId}`,

      name: asset.name,
      vendor: NftVendorId.SignArt,
    };
  }
}
