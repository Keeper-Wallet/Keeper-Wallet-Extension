import {
  DucklingAdjectives,
  DucklingsDescription,
  ducklingsEntriesUrl,
} from 'nfts/ducklings/constants';
import { NftDetails, NftVendor } from 'nfts/index';

export interface DucklingInfo {
  id: string;
  vendor: NftVendor.Ducklings;
  creator: string;
  name: string;
  fgImage: string;
}

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
        const nft = nfts[index];
        const level = parseInt(entries[index].value);
        const growthLevel = level > 0 ? level / 1e14 : 0;
        let fileIndex = Math.trunc(growthLevel / 25);
        fileIndex = fileIndex < 4 ? fileIndex : 3;
        const { adj, name } = getDucklingNameParts(nft.assetId);

        return {
          id: nft.assetId,
          creator: nft.issuer,
          vendor: NftVendor.Ducklings,
          name: `${capitalize(adj)} ${capitalize(name)}`,
          fgImage: `duckling-${fileIndex}.svg`,
        };
      })
    );
}

export const getDucklingNameParts = (ducklingId: string) => {
  const indexes = [16, 10, 1, 9, 9, 7];
  const indexes2 = [10, 4, 2, 0, 2, 1];

  const adjNumber = indexes.reduce(
    (acc, index) => acc + ducklingId.charCodeAt(index),
    0
  );

  const nameNumber = indexes2.reduce(
    (acc, index) => acc + ducklingId.charCodeAt(index),
    0
  );

  const adj = DucklingAdjectives[adjNumber % DucklingAdjectives.length];
  const ducklingNames = Object.keys(DucklingsDescription);
  const name = ducklingNames[nameNumber % ducklingNames.length];
  return { adj, name };
};

function capitalize(str: string): string {
  if (!str) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}
