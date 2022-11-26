import { DataTransactionEntry } from '@waves/ts-types';

export function capitalize(str: string | undefined) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

export function reduceDataEntries(entries: DataTransactionEntry[]) {
  return entries.reduce<Record<string, DataTransactionEntry['value']>>(
    (data, item) => {
      data[item.key] = item.value;
      return data;
    },
    {}
  );
}
