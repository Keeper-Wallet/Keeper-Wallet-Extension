import { Asset, Money } from '@waves/data-entities';
import { type IAssetInfo } from '@waves/data-entities/dist/entities/Asset';

import type { AssetsRecord } from '../assets/types';
import { BLOCKCHAIN_TYPES } from '../assets/constants';
import { type BalancesItem } from './types';

export function getBalanceKey(
  blockchainType: string | undefined,
  network: string | undefined,
  address: string,
): string {
  if (blockchainType === BLOCKCHAIN_TYPES.UNIT0 && network) {
    return `unit0_${network}_${address}`;
  }

  // Waves: include network in key to separate balances per network
  if (blockchainType === BLOCKCHAIN_TYPES.WAVES && network) {
    return `waves_${network}_${address}`;
  }

  // Fallback for legacy data: key is just address
  return address;
}

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

        const [, suffix] = match;

        // suffix can be either:
        // - plain address (legacy)
        // - composite key: "unit0_mainnet_0x..." or "waves_mainnet_3P..."
        return [suffix, value as BalancesItem] as const;
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
