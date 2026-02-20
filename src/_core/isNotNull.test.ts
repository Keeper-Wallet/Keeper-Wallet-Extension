import { isNotNull } from './isNotNull';

describe('isNotNull', () => {
  describe('null and undefined checks', () => {
    it('should return false for null', () => {
      expect(isNotNull(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isNotNull(undefined)).toBe(false);
    });
  });

  describe('truthy values', () => {
    it('should return true for non-empty string', () => {
      expect(isNotNull('hello')).toBe(true);
    });

    it('should return true for positive number', () => {
      expect(isNotNull(42)).toBe(true);
    });

    it('should return true for negative number', () => {
      expect(isNotNull(-10)).toBe(true);
    });

    it('should return true for true boolean', () => {
      expect(isNotNull(true)).toBe(true);
    });

    it('should return true for false boolean', () => {
      expect(isNotNull(false)).toBe(true);
    });

    it('should return true for object', () => {
      expect(isNotNull({ key: 'value' })).toBe(true);
    });

    it('should return true for array', () => {
      expect(isNotNull([1, 2, 3])).toBe(true);
    });

    it('should return true for function', () => {
      expect(isNotNull(() => {})).toBe(true);
    });

    it('should return true for Date object', () => {
      expect(isNotNull(new Date())).toBe(true);
    });

    it('should return true for RegExp', () => {
      expect(isNotNull(/test/)).toBe(true);
    });
  });

  describe('falsy values that are not null/undefined', () => {
    it('should return true for zero', () => {
      expect(isNotNull(0)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isNotNull('')).toBe(true);
    });

    it('should return true for NaN', () => {
      expect(isNotNull(NaN)).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isNotNull([])).toBe(true);
    });

    it('should return true for empty object', () => {
      expect(isNotNull({})).toBe(true);
    });
  });

  describe('type guard behavior', () => {
    it('should narrow type in TypeScript when used in filter', () => {
      const array: Array<number | null | undefined> = [
        1,
        null,
        2,
        undefined,
        3,
      ];
      const filtered: number[] = array.filter(isNotNull);

      expect(filtered).toEqual([1, 2, 3]);
    });

    it('should work with mixed type arrays', () => {
      const array: Array<string | null | undefined> = [
        'a',
        null,
        'b',
        undefined,
        'c',
      ];
      const filtered: string[] = array.filter(isNotNull);

      expect(filtered).toEqual(['a', 'b', 'c']);
    });

    it('should work with object arrays', () => {
      const array: Array<{ id: number } | null | undefined> = [
        { id: 1 },
        null,
        { id: 2 },
        undefined,
        { id: 3 },
      ];
      const filtered: Array<{ id: number }> = array.filter(isNotNull);

      expect(filtered).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('should preserve falsy values that are not null/undefined', () => {
      const array: Array<number | null | undefined> = [
        0,
        null,
        1,
        undefined,
        2,
      ];
      const filtered: number[] = array.filter(isNotNull);

      expect(filtered).toEqual([0, 1, 2]);
    });
  });

  describe('edge cases', () => {
    it('should return true for Symbol', () => {
      expect(isNotNull(Symbol('test'))).toBe(true);
    });

    it('should return true for BigInt', () => {
      expect(isNotNull(BigInt(123))).toBe(true);
    });

    it('should return true for zero BigInt', () => {
      expect(isNotNull(BigInt(0))).toBe(true);
    });

    it('should return true for Infinity', () => {
      expect(isNotNull(Infinity)).toBe(true);
    });

    it('should return true for -Infinity', () => {
      expect(isNotNull(-Infinity)).toBe(true);
    });
  });

  describe('practical use cases', () => {
    it('should filter out null and undefined from array', () => {
      const data = [1, null, 2, undefined, 3, null, 4];
      const result = data.filter(isNotNull);

      expect(result).toEqual([1, 2, 3, 4]);
      expect(result.length).toBe(4);
    });

    it('should work with map and filter chain', () => {
      const data = [1, 2, 3, 4, 5];
      const result = data.map(n => (n % 2 === 0 ? n : null)).filter(isNotNull);

      expect(result).toEqual([2, 4]);
    });

    it('should work in conditional checks', () => {
      const value: string | null = 'test';

      if (isNotNull(value)) {
        // TypeScript knows the value is string here
        expect(value.toUpperCase()).toBe('TEST');
      }
    });

    it('should handle optional chaining results', () => {
      const obj: { nested?: { value?: number } } = { nested: { value: 42 } };
      const value = obj.nested?.value;

      expect(isNotNull(value)).toBe(true);
    });

    it('should handle optional chaining with missing values', () => {
      const obj: { nested?: { value?: number } } = {};
      const value = obj.nested?.value;

      expect(isNotNull(value)).toBe(false);
    });
  });
});
