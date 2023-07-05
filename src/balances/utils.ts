import { type BalancesItem } from './types';

export function collectBalances(
  obj: Record<string, unknown>,
): Partial<Record<string, BalancesItem>> {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => {
        const match = key.match(/^balance_(.*)$/);

        if (!match) {
          return null;
        }

        const [, address] = match;

        return [address, value as BalancesItem] as const;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry != null),
  );
}
