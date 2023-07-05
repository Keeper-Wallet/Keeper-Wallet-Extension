import invariant from 'tiny-invariant';

import { chunk } from './chunk';

export async function fetchInBatches<I, T>(
  allItems: I[],
  chunkSize: number,
  fetchFn: (items: I[]) => Promise<T[]>,
) {
  const result: T[] = [];

  for (const items of chunk(allItems, chunkSize)) {
    const data = await fetchFn(items);
    invariant(Array.isArray(data));

    result.push(...data);
  }

  return result;
}
