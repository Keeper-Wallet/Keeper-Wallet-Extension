import {
  CreateParams,
  FetchInfoParams,
  NftAssetDetail,
  NftVendor,
  NftVendorId,
} from '../types';
import { reduceDataEntries } from '../utils';

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

function signArtDataUrl(nodeUrl: string) {
  return new URL(`addresses/data/${SIGN_ART_DAPP}`, nodeUrl).toString();
}

function signArtUserDataUrl(nodeUrl: string) {
  return new URL(`addresses/data/${SIGN_ART_USER_DAPP}`, nodeUrl).toString();
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

    return fetch(signArtDataUrl(nodeUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keys: nftIds.map(id => nftIdKey(id)),
      }),
    })
      .then(response =>
        response.ok
          ? response.json()
          : response.text().then(text => Promise.reject(new Error(text)))
      )
      .then(reduceDataEntries)
      .then(dataEntries =>
        nftIds.map(id => {
          const value = dataEntries[nftIdKey(id)];
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const [, artworkId, creator] = (value as string).match(
            /art_sold_\d+_of_\d+_(\w+)_(\w+)/i
          )!;
          return { artworkId, creator };
        })
      )
      .then(artworks =>
        Promise.all([
          fetch(signArtDataUrl(nodeUrl), {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
          }).then(response =>
            response.ok
              ? response.json()
              : response.text().then(text => Promise.reject(new Error(text)))
          ),
          fetch(signArtUserDataUrl(nodeUrl), {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              keys: nftIds.map((id, index) => {
                const info = artworks[index];
                return `user_name_${info.creator}`;
              }),
            }),
          }).then(response =>
            response.ok
              ? response.json()
              : response.text().then(text => Promise.reject(new Error(text)))
          ),
        ])
      )
      .then(([artworksEntries, userNameEntries]) =>
        nftIds.map((id, index): SignArtNftInfo => {
          const entriesPerAsset = 4;
          const artName = artworksEntries[entriesPerAsset * index];
          const artDesc = artworksEntries[entriesPerAsset * index + 1];
          const artDisplayCid = artworksEntries[entriesPerAsset * index + 2];
          const userName = userNameEntries[index];
          const [, artworkId, creator] =
            artName.key.match(/art_name_(\w+)_(\w+)/i);

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
