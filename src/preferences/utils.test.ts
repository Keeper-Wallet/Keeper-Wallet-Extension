import { compareAccountsByLastUsed } from './utils';

describe('preferences/utils', () => {
  describe('compareAccountsByLastUsed', () => {
    it('should return 0 when both accounts have no lastUsed', () => {
      const accA = { lastUsed: null } as never;
      const accB = { lastUsed: null } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBe(0);
    });

    it('should return 0 when both accounts have undefined lastUsed', () => {
      const accA = { lastUsed: undefined } as never;
      const accB = { lastUsed: undefined } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBe(0);
    });

    it('should return 1 when first account has no lastUsed and second has', () => {
      const accA = { lastUsed: null } as never;
      const accB = { lastUsed: 1000 } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBe(1);
    });

    it('should return -1 when second account has no lastUsed and first has', () => {
      const accA = { lastUsed: 1000 } as never;
      const accB = { lastUsed: null } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBe(-1);
    });

    it('should return negative when first account was used more recently', () => {
      const accA = { lastUsed: 2000 } as never;
      const accB = { lastUsed: 1000 } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBeLessThan(0);
      expect(result).toBe(-1000);
    });

    it('should return positive when second account was used more recently', () => {
      const accA = { lastUsed: 1000 } as never;
      const accB = { lastUsed: 2000 } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBeGreaterThan(0);
      expect(result).toBe(1000);
    });

    it('should return 0 when both accounts have same lastUsed', () => {
      const accA = { lastUsed: 1500 } as never;
      const accB = { lastUsed: 1500 } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBe(0);
    });

    it('should work with large timestamp values', () => {
      const accA = { lastUsed: 1700000000000 } as never;
      const accB = { lastUsed: 1600000000000 } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBeLessThan(0);
    });

    it('should handle undefined as null', () => {
      const accA = { lastUsed: undefined } as never;
      const accB = { lastUsed: 1000 } as never;

      const result = compareAccountsByLastUsed(accA, accB);

      expect(result).toBe(1);
    });
  });
});
