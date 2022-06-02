import { signArtData, signArtUserData } from 'nfts/signArt/constants';
import { NftDetails, NftVendor } from 'nfts/index';
import { SignArtInfo } from 'nfts/signArt/index';

export const artworkInfoMask = /art_sold_\d+_of_\d+_(\w+)_(\w+)/i;

export async function fetchAll(nfts: NftDetails[]): Promise<SignArtInfo[]> {
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
      Promise.all([
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
        }).then(response =>
          response.ok
            ? response.json()
            : response.text().then(text => Promise.reject(new Error(text)))
        ),
        fetch(signArtUserData, {
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
      nftIds.map((id, index) => {
        const entriesPerAsset = 4;
        const artName = artworksEntries[entriesPerAsset * index];
        const artDesc = artworksEntries[entriesPerAsset * index + 1];
        const artDisplayCid = artworksEntries[entriesPerAsset * index + 2];
        const userName = userNameEntries[index];

        return {
          id,
          vendor: NftVendor.SignArt,
          creator: userName.key.match(/user_name_(\w+)/i)[1],
          userName: userName.value,
          name: artName.value,
          description: artDesc.value,
          cid: artDisplayCid.value,
        };
      }, [])
    );
}
