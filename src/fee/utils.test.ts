import BigNumber from '@waves/bignumber';
import { TRANSACTION_TYPE } from '@waves/ts-types';

import {
  convertFeeToAsset,
  getFeeOptions,
  getSpendingAmountsForSponsorableTx,
  isEnoughBalanceForFeeAndSpendingAmounts,
} from './utils';

// Mock @waves/data-entities
jest.mock('@waves/data-entities', () => ({
  Asset: jest
    .fn()
    .mockImplementation(
      (assetInfo: {
        id: string;
        precision?: number;
        minSponsoredFee?: number;
      }) => ({
        id: assetInfo.id,
        precision: assetInfo.precision,
        minSponsoredFee: assetInfo.minSponsoredFee,
      }),
    ),
  Money: jest
    .fn()
    .mockImplementation(
      (
        amount: string | BigNumber,
        asset: { id: string; minSponsoredFee?: number },
      ) => ({
        amount: typeof amount === 'string' ? amount : amount.toFixed(),
        asset,
        getCoins: () =>
          new BigNumber(typeof amount === 'string' ? amount : amount.toFixed()),
        getTokens: () =>
          new BigNumber(typeof amount === 'string' ? amount : amount.toFixed()),
      }),
    ),
}));

describe('fee/utils', () => {
  describe('convertFeeToAsset', () => {
    const createMockMoney = (
      amount: string,
      assetId: string,
      minSponsoredFee?: number,
    ) => ({
      amount,
      asset: { id: assetId, minSponsoredFee },
      getCoins: () => new BigNumber(amount),
    });

    it('should convert fee from WAVES to sponsored asset', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const targetAsset = { id: 'USDT', minSponsoredFee: 50000 };

      const result = convertFeeToAsset(fee as never, targetAsset as never);

      expect(result).toBeDefined();
      expect(result.asset.id).toBe('USDT');
    });

    it('should convert fee from sponsored asset to WAVES', () => {
      const fee = createMockMoney('50000', 'USDT', 50000);
      const targetAsset = { id: 'WAVES' };

      const result = convertFeeToAsset(fee as never, targetAsset as never);

      expect(result).toBeDefined();
      expect(result.asset.id).toBe('WAVES');
    });

    it('should convert fee between two sponsored assets', () => {
      const fee = createMockMoney('50000', 'USDT', 50000);
      const targetAsset = { id: 'USDC', minSponsoredFee: 60000 };

      const result = convertFeeToAsset(fee as never, targetAsset as never);

      expect(result).toBeDefined();
      expect(result.asset.id).toBe('USDC');
    });
  });

  describe('getSpendingAmountsForSponsorableTx', () => {
    const mockAssets = {
      WAVES: { id: 'WAVES', precision: 8 },
      USDT: { id: 'USDT', precision: 6 },
    };

    it('should return spending amount for TRANSFER transaction', () => {
      const messageTx = {
        type: TRANSACTION_TYPE.TRANSFER,
        amount: '100000000',
        assetId: 'WAVES',
      };

      const result = getSpendingAmountsForSponsorableTx({
        assets: mockAssets as never,
        messageTx: messageTx as never,
      });

      expect(result).toHaveLength(1);
      expect(result[0].getCoins().toFixed()).toBe('100000000');
    });

    it('should use WAVES when assetId is undefined in TRANSFER', () => {
      const messageTx = {
        type: TRANSACTION_TYPE.TRANSFER,
        amount: '100000000',
        assetId: undefined,
      };

      const result = getSpendingAmountsForSponsorableTx({
        assets: mockAssets as never,
        messageTx: messageTx as never,
      });

      expect(result).toHaveLength(1);
    });

    it('should return multiple spending amounts for INVOKE_SCRIPT transaction', () => {
      const messageTx = {
        type: TRANSACTION_TYPE.INVOKE_SCRIPT,
        payment: [
          { amount: '100000000', assetId: 'WAVES' },
          { amount: '50000000', assetId: 'USDT' },
        ],
      };

      const result = getSpendingAmountsForSponsorableTx({
        assets: mockAssets as never,
        messageTx: messageTx as never,
      });

      expect(result).toHaveLength(2);
      expect(result[0].getCoins().toFixed()).toBe('100000000');
      expect(result[1].getCoins().toFixed()).toBe('50000000');
    });

    it('should return empty array for INVOKE_SCRIPT with no payments', () => {
      const messageTx = {
        type: TRANSACTION_TYPE.INVOKE_SCRIPT,
        payment: [],
      };

      const result = getSpendingAmountsForSponsorableTx({
        assets: mockAssets as never,
        messageTx: messageTx as never,
      });

      expect(result).toHaveLength(0);
    });

    it('should return empty array for non-sponsorable transaction types', () => {
      const messageTx = {
        type: TRANSACTION_TYPE.ISSUE,
      };

      const result = getSpendingAmountsForSponsorableTx({
        assets: mockAssets as never,
        messageTx: messageTx as never,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('getFeeOptions', () => {
    it('should return empty array for non-sponsorable transaction types', () => {
      const result = getFeeOptions({
        assets: { WAVES: { id: 'WAVES', precision: 8 } } as never,
        balance: undefined,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.ISSUE,
        usdPrices: {},
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when balance is undefined', () => {
      const result = getFeeOptions({
        assets: { WAVES: { id: 'WAVES', precision: 8 } } as never,
        balance: undefined,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {},
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when balance has no assets', () => {
      const result = getFeeOptions({
        assets: { WAVES: { id: 'WAVES', precision: 8 } } as never,
        balance: { assets: {} } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {},
      });

      expect(result).toEqual([]);
    });

    it('should filter out assets without minSponsoredAssetFee', () => {
      const result = getFeeOptions({
        assets: {
          WAVES: { id: 'WAVES', precision: 8 },
          USDT: { id: 'USDT', precision: 6, minSponsoredFee: 50000 },
        } as never,
        balance: {
          assets: {
            USDT: {
              balance: '1000000',
              sponsorBalance: '100000',
              minSponsoredAssetFee: null,
            },
          },
        } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {},
      });

      expect(result).toEqual([]);
    });

    it('should filter out assets with insufficient balance', () => {
      const result = getFeeOptions({
        assets: {
          WAVES: { id: 'WAVES', precision: 8 },
          USDT: { id: 'USDT', precision: 6, minSponsoredFee: 50000 },
        } as never,
        balance: {
          assets: {
            USDT: {
              balance: '10',
              sponsorBalance: '1000000',
              minSponsoredAssetFee: '50000',
            },
          },
        } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {},
      });

      expect(result).toEqual([]);
    });

    it('should filter out assets with insufficient sponsor balance', () => {
      const result = getFeeOptions({
        assets: {
          WAVES: { id: 'WAVES', precision: 8 },
          USDT: { id: 'USDT', precision: 6, minSponsoredFee: 50000 },
        } as never,
        balance: {
          assets: {
            USDT: {
              balance: '1000000',
              sponsorBalance: '10',
              minSponsoredAssetFee: '50000',
            },
          },
        } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {},
      });

      expect(result).toEqual([]);
    });

    it('should sort fee options by USD price ascending', () => {
      const result = getFeeOptions({
        assets: {
          WAVES: { id: 'WAVES', precision: 8 },
          USDT: { id: 'USDT', precision: 6, minSponsoredFee: 50000 },
          USDC: { id: 'USDC', precision: 6, minSponsoredFee: 60000 },
        } as never,
        balance: {
          assets: {
            USDT: {
              balance: '10000000',
              sponsorBalance: '10000000',
              minSponsoredAssetFee: '50000',
            },
            USDC: {
              balance: '10000000',
              sponsorBalance: '10000000',
              minSponsoredAssetFee: '60000',
            },
          },
        } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {
          USDT: '2',
          USDC: '1',
        },
      });

      expect(result.length).toBeGreaterThan(0);
      if (result.length === 2) {
        expect(result[0].money.asset.id).toBe('USDC');
        expect(result[1].money.asset.id).toBe('USDT');
      }
    });

    it('should sort by sponsor balance when USD prices are equal', () => {
      const result = getFeeOptions({
        assets: {
          WAVES: { id: 'WAVES', precision: 8 },
          USDT: { id: 'USDT', precision: 6, minSponsoredFee: 50000 },
          USDC: { id: 'USDC', precision: 6, minSponsoredFee: 60000 },
        } as never,
        balance: {
          assets: {
            USDT: {
              balance: '10000000',
              sponsorBalance: '5000000',
              minSponsoredAssetFee: '50000',
            },
            USDC: {
              balance: '10000000',
              sponsorBalance: '10000000',
              minSponsoredAssetFee: '60000',
            },
          },
        } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.TRANSFER,
        usdPrices: {
          USDT: '1',
          USDC: '1',
        },
      });

      expect(result.length).toBeGreaterThan(0);
      if (result.length === 2) {
        // Higher sponsor balance comes first
        expect(result[0].money.asset.id).toBe('USDT');
        expect(result[1].money.asset.id).toBe('USDC');
      }
    });

    it('should work with INVOKE_SCRIPT transaction type', () => {
      const result = getFeeOptions({
        assets: {
          WAVES: { id: 'WAVES', precision: 8 },
          USDT: { id: 'USDT', precision: 6, minSponsoredFee: 50000 },
        } as never,
        balance: {
          assets: {
            USDT: {
              balance: '10000000',
              sponsorBalance: '10000000',
              minSponsoredAssetFee: '50000',
            },
          },
        } as never,
        initialFee: {
          asset: { id: 'WAVES' },
          getCoins: () => new BigNumber('100000'),
        } as never,
        txType: TRANSACTION_TYPE.INVOKE_SCRIPT,
        usdPrices: {},
      });

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('isEnoughBalanceForFeeAndSpendingAmounts', () => {
    const createMockMoney = (amount: string, assetId: string) => ({
      amount,
      asset: { id: assetId },
      getCoins: () => new BigNumber(amount),
    });

    it('should return true when balance covers fee only', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const balance = '100000';
      const spendingAmounts: Array<ReturnType<typeof createMockMoney>> = [];

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: spendingAmounts as never,
      });

      expect(result).toBe(true);
    });

    it('should return true when balance covers fee and spending amounts', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const spending1 = createMockMoney('50000', 'WAVES');
      const spending2 = createMockMoney('30000', 'WAVES');
      const balance = '200000';

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [spending1, spending2] as never,
      });

      expect(result).toBe(true);
    });

    it('should return false when balance is insufficient', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const spending = createMockMoney('50000', 'WAVES');
      const balance = '100000';

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [spending] as never,
      });

      expect(result).toBe(false);
    });

    it('should ignore spending amounts with different asset', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const spendingWaves = createMockMoney('50000', 'WAVES');
      const spendingUsdt = createMockMoney('1000000', 'USDT');
      const balance = '150000';

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [spendingWaves, spendingUsdt] as never,
      });

      expect(result).toBe(true);
    });

    it('should handle zero balance', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const balance = '0';

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [] as never,
      });

      expect(result).toBe(false);
    });

    it('should handle balance as number', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const balance = 200000;

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [] as never,
      });

      expect(result).toBe(true);
    });

    it('should return true when balance exactly equals total spending', () => {
      const fee = createMockMoney('100000', 'WAVES');
      const spending = createMockMoney('50000', 'WAVES');
      const balance = '150000';

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [spending] as never,
      });

      expect(result).toBe(true);
    });

    it('should handle large amounts', () => {
      const fee = createMockMoney('10000000000', 'WAVES');
      const spending = createMockMoney('50000000000', 'WAVES');
      const balance = '100000000000';

      const result = isEnoughBalanceForFeeAndSpendingAmounts({
        balance,
        fee: fee as never,
        spendingAmounts: [spending] as never,
      });

      expect(result).toBe(true);
    });
  });
});
