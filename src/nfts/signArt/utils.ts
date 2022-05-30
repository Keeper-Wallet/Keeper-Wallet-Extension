import { signArtDApp, signArtData } from 'nfts/signArt/constants';
import { NftDetails } from 'controllers/NftInfoController';
import { NFT } from 'nfts/utils';

export interface SignArtInfo {
  id: string;
  vendor: NFT.SignArt;
  name: string;
  description: string;
  type: string;
  isVideo?: boolean;
  fgImage: string;
}

export const artworkInfoMask = /art_sold_\d+_of_\d+_(\w+)_(\w+)/i;

export async function fetchAllSignArts(
  nfts: NftDetails[]
): Promise<SignArtInfo[]> {
  if (nfts.length === 0) {
    return [];
  }

  const nftIds = nfts.map(nft => nft.assetId);

  return fetch(signArtData, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      keys: nftIds.map(id => `nft_${id}`),
    }),
  })
    .then(response =>
      response.ok
        ? response.json()
        : response.text().then(text => Promise.reject(new Error(text)))
    )
    .then(entries =>
      nftIds.map((id, index) => {
        const value = entries && entries[index].value;
        const [, artworkId, creator] = value.match(artworkInfoMask);
        return { artworkId, creator };
      })
    )
    .then(artworks =>
      fetch(signArtData, {
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
      })
    )
    .then(response =>
      response.ok
        ? response.json()
        : response.text().then(text => Promise.reject(new Error(text)))
    )
    .then(artworksEntries =>
      nftIds.map((id, index) => {
        const entriesPerAsset = 4;
        const artName = artworksEntries[entriesPerAsset * index];
        const artDesc = artworksEntries[entriesPerAsset * index + 1];
        const artDisplayCid = artworksEntries[entriesPerAsset * index + 2];
        const artType = artworksEntries[entriesPerAsset * index + 3];

        return {
          id,
          vendor: NFT.SignArt,
          creator: artName.key.match(/art_name_\w+_(\w+)/i)[1],
          name: artName.value,
          description: artDesc.value,
          type: artType.value,
          isVideo: !!artDisplayCid.value.match(/\.mp4$/i),
          fgImage: artDisplayCid.value,
        };
      }, [])
    );
}

export async function fetchSignArt(
  nft: NftDetails
): Promise<SignArtInfo | null> {
  if (!nft?.assetId || nft?.issuer !== signArtDApp) {
    return null;
  }

  return fetchAllSignArts([nft]).then(details => details[0]);
}
