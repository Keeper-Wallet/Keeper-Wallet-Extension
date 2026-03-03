import { Asset, Money } from '@waves/data-entities';

import type { AssetDetail, AssetsRecord } from '../assets/types';
import type { BalancesItem } from './types';
import {
  collectBalances,
  createMoneyFromBalance,
  getBalanceKey,
} from './utils';

// Mock the constants module to avoid import.meta.url issues
jest.mock('../assets/constants', () => ({
  BLOCKCHAIN_TYPES: {
    WAVES: 'waves',
    UNIT0: 'unit0',
  },
}));

// Mock the Asset and Money classes
jest.mock('@waves/data-entities', () => ({
  Asset: jest
    .fn()
    .mockImplementation((assetInfo: { id: string; precision: number }) => ({
      assetInfo,
      id: assetInfo.id,
      decimals: assetInfo.precision,
    })),
  Money: jest.fn().mockImplementation((amount: string, asset: unknown) => ({
    amount,
    asset,
  })),
}));

// Import BLOCKCHAIN_TYPES after mocking
const { BLOCKCHAIN_TYPES } = jest.requireMock('../assets/constants');

describe('balances/utils', () => {
  describe('getBalanceKey', () => {
    describe('Unit0 blockchain', () => {
      it('should create key with unit0 prefix for Unit0 blockchain', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.UNIT0,
          'mainnet',
          '0x1234567890abcdef',
        );

        expect(result).toBe('unit0_mainnet_0x1234567890abcdef');
      });

      it('should create key with unit0 prefix for testnet', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.UNIT0,
          'testnet',
          '0xabcdef1234567890',
        );

        expect(result).toBe('unit0_testnet_0xabcdef1234567890');
      });
    });

    describe('Waves blockchain', () => {
      it('should create key with waves prefix for Waves blockchain', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.WAVES,
          'mainnet',
          '3P3YourWavesAddress',
        );

        expect(result).toBe('waves_mainnet_3P3YourWavesAddress');
      });

      it('should create key with waves prefix for testnet', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.WAVES,
          'testnet',
          '3M3YourTestAddress',
        );

        expect(result).toBe('waves_testnet_3M3YourTestAddress');
      });

      it('should create key with waves prefix for stagenet', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.WAVES,
          'stagenet',
          '3S3YourStageAddress',
        );

        expect(result).toBe('waves_stagenet_3S3YourStageAddress');
      });
    });

    describe('legacy fallback', () => {
      it('should return plain address when blockchain type is undefined', () => {
        const result = getBalanceKey(undefined, 'mainnet', '3P3YourAddress');

        expect(result).toBe('3P3YourAddress');
      });

      it('should return plain address when network is undefined', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.WAVES,
          undefined,
          '3P3YourAddress',
        );

        expect(result).toBe('3P3YourAddress');
      });

      it('should return plain address when both are undefined', () => {
        const result = getBalanceKey(undefined, undefined, '3P3YourAddress');

        expect(result).toBe('3P3YourAddress');
      });

      it('should return plain address for unknown blockchain type', () => {
        const result = getBalanceKey('unknown', 'mainnet', '3P3YourAddress');

        expect(result).toBe('3P3YourAddress');
      });
    });

    describe('edge cases', () => {
      it('should handle empty address', () => {
        const result = getBalanceKey(BLOCKCHAIN_TYPES.WAVES, 'mainnet', '');

        expect(result).toBe('waves_mainnet_');
      });

      it('should handle real Waves mainnet address', () => {
        const result = getBalanceKey(
          BLOCKCHAIN_TYPES.WAVES,
          'mainnet',
          '3PNCPLehr6Vprr66LqoHidqqwYWhHpPPUmR',
        );

        expect(result).toBe(
          'waves_mainnet_3PNCPLehr6Vprr66LqoHidqqwYWhHpPPUmR',
        );
      });
    });
  });

  describe('collectBalances', () => {
    describe('basic functionality', () => {
      it('should extract balance entries from object', () => {
        const obj = {
          balance_address1: { regular: '1000' },
          balance_address2: { regular: '2000' },
          otherKey: 'ignored',
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          address1: { regular: '1000' },
          address2: { regular: '2000' },
        });
      });

      it('should handle composite keys with unit0 prefix', () => {
        const obj = {
          balance_unit0_mainnet_0x1234: { regular: '5000' },
          balance_unit0_testnet_0x5678: { regular: '3000' },
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          unit0_mainnet_0x1234: { regular: '5000' },
          unit0_testnet_0x5678: { regular: '3000' },
        });
      });

      it('should handle composite keys with waves prefix', () => {
        const obj = {
          balance_waves_mainnet_3P123: { regular: '10000' },
          balance_waves_testnet_3M456: { regular: '20000' },
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          waves_mainnet_3P123: { regular: '10000' },
          waves_testnet_3M456: { regular: '20000' },
        });
      });
    });

    describe('filtering', () => {
      it('should ignore non-balance keys', () => {
        const obj = {
          balance_address1: { regular: '1000' },
          notABalance: { regular: '2000' },
          someOtherKey: 'value',
          balance_address2: { regular: '3000' },
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          address1: { regular: '1000' },
          address2: { regular: '3000' },
        });
      });

      it('should handle keys that start with balance but have no underscore', () => {
        const obj = {
          balance: { regular: '1000' },
          balanceNoUnderscore: { regular: '2000' },
          balance_valid: { regular: '3000' },
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          valid: { regular: '3000' },
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty object', () => {
        const result = collectBalances({});

        expect(result).toEqual({});
      });

      it('should handle object with no balance keys', () => {
        const obj = {
          key1: 'value1',
          key2: 'value2',
        };

        const result = collectBalances(obj);

        expect(result).toEqual({});
      });

      it('should preserve balance data structure', () => {
        const balanceData: BalancesItem = {
          regular: '1000',
          available: '900',
          leasedOut: '100',
          assets: {
            WAVES: {
              balance: '1000',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const obj = {
          balance_address1: balanceData,
        };

        const result = collectBalances(obj);

        expect(result.address1).toEqual(balanceData);
      });

      it('should handle balance with empty suffix', () => {
        const obj = {
          balance_: { regular: '1000' },
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          '': { regular: '1000' },
        });
      });
    });

    describe('mixed scenarios', () => {
      it('should handle mix of legacy and composite keys', () => {
        const obj = {
          balance_3P123: { regular: '1000' },
          balance_waves_mainnet_3P456: { regular: '2000' },
          balance_unit0_mainnet_0x789: { regular: '3000' },
        };

        const result = collectBalances(obj);

        expect(result).toEqual({
          '3P123': { regular: '1000' },
          waves_mainnet_3P456: { regular: '2000' },
          unit0_mainnet_0x789: { regular: '3000' },
        });
      });
    });
  });

  describe('createMoneyFromBalance', () => {
    const mockWavesAsset: AssetDetail = {
      id: 'WAVES',
      precision: 8,
      name: 'Waves',
      description: 'Waves token',
      displayName: 'WAVES',
      height: 0,
      issuer: '',
      quantity: '0',
      reissuable: false,
      sender: '',
      timestamp: new Date(),
    };

    const mockUnit0Asset: AssetDetail = {
      id: 'unit0',
      precision: 18,
      name: 'Unit0',
      description: 'Unit0 token',
      displayName: 'UNIT0',
      height: 0,
      issuer: '',
      quantity: '0',
      reissuable: false,
      sender: '',
      timestamp: new Date(),
    };

    const mockAssets: AssetsRecord = {
      WAVES: mockWavesAsset,
      unit0: mockUnit0Asset,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Waves balances', () => {
      it('should create Money with WAVES asset for Waves balance', () => {
        const balance: BalancesItem = {
          regular: '100000000',
          assets: {
            WAVES: {
              balance: '100000000',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(Asset).toHaveBeenCalledWith(mockWavesAsset);
        expect(Money).toHaveBeenCalledWith('100000000', expect.any(Object));
        expect(result).toBeDefined();
      });

      it('should handle zero balance', () => {
        const balance: BalancesItem = {
          regular: '0',
          assets: {
            WAVES: {
              balance: '0',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(Money).toHaveBeenCalledWith('0', expect.any(Object));
        expect(result).toBeDefined();
      });

      it('should handle large balance amounts', () => {
        const balance: BalancesItem = {
          regular: '999999999999999',
          assets: {
            WAVES: {
              balance: '999999999999999',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(Money).toHaveBeenCalledWith(
          '999999999999999',
          expect.any(Object),
        );
        expect(result).toBeDefined();
      });
    });

    describe('Unit0 balances', () => {
      it('should create Money with unit0 asset when balance has unit0 asset', () => {
        const balance: BalancesItem = {
          regular: '1000000000000000000',
          assets: {
            unit0: {
              balance: '1000000000000000000',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(Asset).toHaveBeenCalledWith(mockUnit0Asset);
        expect(Money).toHaveBeenCalledWith(
          '1000000000000000000',
          expect.any(Object),
        );
        expect(result).toBeDefined();
      });

      it('should handle zero unit0 balance', () => {
        const balance: BalancesItem = {
          regular: '0',
          assets: {
            unit0: {
              balance: '0',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(Asset).toHaveBeenCalledWith(mockUnit0Asset);
        expect(result).toBeDefined();
      });
    });

    describe('undefined and null handling', () => {
      it('should return undefined when balance is undefined', () => {
        const result = createMoneyFromBalance(undefined, mockAssets);

        expect(result).toBeUndefined();
        expect(Asset).not.toHaveBeenCalled();
        expect(Money).not.toHaveBeenCalled();
      });

      it('should return undefined when balance.regular is undefined', () => {
        const balance: BalancesItem = {};

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(result).toBeUndefined();
      });

      it('should handle balance with only assets but no regular', () => {
        const balance: BalancesItem = {
          assets: {
            unit0: {
              balance: '1000',
              sponsorBalance: '0',
              minSponsoredAssetFee: null,
            },
          },
        };

        const result = createMoneyFromBalance(balance, mockAssets);

        expect(result).toBeUndefined();
      });
    });
  });
});
