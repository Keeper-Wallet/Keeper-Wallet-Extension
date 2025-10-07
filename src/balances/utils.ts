import { Asset, Money } from '@waves/data-entities';
import { type IAssetInfo } from '@waves/data-entities/dist/entities/Asset';

import type { AssetsRecord } from '../assets/types';
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

/**
 * Creates a Money object from balance data with the correct asset (Waves or Unit0)
 * based on the balance's blockchain type.
 * 
 * Determines the blockchain by checking if balance.assets.unit0 exists:
 * - If unit0 asset exists -> uses Unit0 asset (18 decimals)
 * - Otherwise -> uses WAVES asset (8 decimals)
 * 
 * @param balance - The balance item containing regular balance and assets
 * @param assets - The assets record containing WAVES and unit0 assets
 * @returns Money object with correct asset, or undefined if balance.regular is undefined
 */
export function createMoneyFromBalance(
  balance: BalancesItem | undefined,
  assets: AssetsRecord,
): Money | undefined {
  if (!balance || typeof balance.regular === 'undefined') {
    return undefined;
  }

  // Check if this balance has unit0 asset to determine blockchain type
  const hasUnit0Asset = balance.assets?.unit0 !== undefined;

  const wavesAsset = new Asset(assets.WAVES as IAssetInfo);
  const unit0Asset = assets.unit0 ? new Asset(assets.unit0 as IAssetInfo) : null;

  const asset = hasUnit0Asset && unit0Asset ? unit0Asset : wavesAsset;

  return new Money(balance.regular, asset);
}
