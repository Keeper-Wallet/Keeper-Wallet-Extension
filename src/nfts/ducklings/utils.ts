import { ducklingsEntriesUrl } from 'nfts/ducklings/constants';
import { NftDetails, NftVendor } from 'nfts/index';
import { DucklingInfo } from 'nfts/ducklings/index';

export async function fetchAll(nfts: NftDetails[]): Promise<DucklingInfo[]> {
  if (nfts.length === 0) {
    return [];
  }

  const nftIds = nfts.map(nft => nft.assetId);

  return fetch(ducklingsEntriesUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      keys: nftIds.map(id => `duckling_${id}_level`),
    }),
  })
    .then(response =>
      response.ok
        ? response.json()
        : response.text().then(text => Promise.reject(new Error(text)))
    )
    .then(entries =>
      nftIds.map((id, index) => {
        const level = parseInt(entries[index].value);
        const growthLevel = level > 0 ? level / 1e14 : 0;

        return {
          id,
          vendor: NftVendor.Ducklings,
          growthLevel,
        };
      })
    );
}
