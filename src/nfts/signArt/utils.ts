import { AssetDetail } from 'ui/services/Background';
import { signArtDApp, signArtUrl, soldMask } from 'nfts/signArt/constants';

export interface SignArtInfo {
  name: string;
  description: string;
  type: string;
  isVideo?: boolean;
  fgImage: string;
}

export async function getNftInfo(
  nft: AssetDetail
): Promise<SignArtInfo | null> {
  if (!nft?.id || nft?.issuer !== signArtDApp) {
    return null;
  }

  return fetch(
    signArtUrl +
      '?' +
      new URLSearchParams({
        key: `nft_${nft.id}`,
      }).toString()
  )
    .then(response =>
      response.ok
        ? response.json()
        : response.text().then(text => Promise.reject(new Error(text)))
    )
    .then(entries => {
      const value = entries && entries[0].value;
      const [, num, total, artworkId, creator] = value.match(soldMask);

      return {
        num,
        total,
        artworkId,
        creator,
      };
    })
    .then(info =>
      fetch(signArtUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keys: [
            `art_name_${info.artworkId}_${info.creator}`,
            `art_desc_${info.artworkId}_${info.creator}`,
            `art_display_cid_${info.artworkId}_${info.creator}`,
            `art_type_${info.artworkId}_${info.creator}`,
          ],
        }),
      })
    )
    .then(response =>
      response.ok
        ? response.json()
        : response.text().then(text => Promise.reject(new Error(text)))
    )
    .then(keys => ({
      name: keys[0].value,
      description: keys[1].value,
      fgImage: `https://ipfs.io/ipfs/${keys[2]?.value}`,
      type: keys[3].value,
      isVideo: !!keys[2].value.match(/\.mp4$/i),
      cid: keys[2].value,
    }));
}
