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

export function fetchDataEntries<T extends DataTransactionEntry>(
  url: string,
  allKeys: string[]
) {
  return fetchInBatches(allKeys, NODE_DATA_KEYS_REQUEST_LIMIT, keys =>
    fetch(url, {
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
