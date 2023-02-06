import { type DataTransactionEntry } from '@waves/ts-types';

import { fetchInBatches } from '../_core/fetchInBatches';

export function dataEntriesToRecord<T extends DataTransactionEntry>(
  entries: T[]
) {
  return entries.reduce<Record<string, T['value']>>((data, item) => {
    data[item.key] = item.value;
    return data;
  }, {});
}

const NODE_DATA_KEYS_REQUEST_LIMIT = 1000;

function createDataUrl(nodeUrl: string, address: string) {
  return new URL(`addresses/data/${address}`, nodeUrl).toString();
}

export function fetchDataEntries<T extends DataTransactionEntry>({
  nodeUrl,
  address,
  keys: allKeys,
}: {
  nodeUrl: string;
  address: string;
  keys: string[];
}) {
  return fetchInBatches(allKeys, NODE_DATA_KEYS_REQUEST_LIMIT, keys =>
    fetch(createDataUrl(nodeUrl, address), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys }),
    }).then(
      (response): Promise<T[]> =>
        response.ok
          ? response.json()
          : response.text().then(text => Promise.reject(new Error(text)))
    )
  );
}
