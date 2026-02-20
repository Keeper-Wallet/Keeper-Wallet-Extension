import { chunk } from './chunk';

describe('chunk', () => {
  describe('basic functionality', () => {
    it('should split array into chunks of specified size', () => {
      const input = [1, 2, 3, 4, 5, 6];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    it('should handle chunk size of 1', () => {
      const input = [1, 2, 3];
      const result = Array.from(chunk(input, 1));

      expect(result).toEqual([[1], [2], [3]]);
    });

    it('should handle chunk size equal to array length', () => {
      const input = [1, 2, 3, 4];
      const result = Array.from(chunk(input, 4));

      expect(result).toEqual([[1, 2, 3, 4]]);
    });

    it('should handle chunk size larger than array length', () => {
      const input = [1, 2, 3];
      const result = Array.from(chunk(input, 10));

      expect(result).toEqual([[1, 2, 3]]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const input: number[] = [];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([]);
    });

    it('should handle array length not divisible by chunk size', () => {
      const input = [1, 2, 3, 4, 5];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle single element array', () => {
      const input = [42];
      const result = Array.from(chunk(input, 3));

      expect(result).toEqual([[42]]);
    });

    it('should handle large chunk sizes', () => {
      const input = [1, 2, 3];
      const result = Array.from(chunk(input, 1000));

      expect(result).toEqual([[1, 2, 3]]);
    });
  });

  describe('different data types', () => {
    it('should work with strings', () => {
      const input = ['a', 'b', 'c', 'd', 'e'];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
    });

    it('should work with objects', () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([[{ id: 1 }, { id: 2 }], [{ id: 3 }]]);
    });

    it('should work with mixed types', () => {
      const input = [1, 'two', { three: 3 }, null, undefined];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([[1, 'two'], [{ three: 3 }, null], [undefined]]);
    });

    it('should work with nested arrays', () => {
      const input = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      const result = Array.from(chunk(input, 2));

      expect(result).toEqual([
        [
          [1, 2],
          [3, 4],
        ],
        [[5, 6]],
      ]);
    });
  });

  describe('generator behavior', () => {
    it('should return a generator', () => {
      const input = [1, 2, 3];
      const gen = chunk(input, 2);

      expect(typeof gen.next).toBe('function');
      expect(typeof gen[Symbol.iterator]).toBe('function');
    });

    it('should be iterable with for...of', () => {
      const input = [1, 2, 3, 4, 5];
      const result: number[][] = [];

      for (const c of chunk(input, 2)) {
        result.push(c);
      }

      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should support manual iteration with next()', () => {
      const input = [1, 2, 3, 4];
      const gen = chunk(input, 2);

      expect(gen.next().value).toEqual([1, 2]);
      expect(gen.next().value).toEqual([3, 4]);
      expect(gen.next().done).toBe(true);
    });

    it('should be lazy and not process until consumed', () => {
      const input = [1, 2, 3, 4];
      const gen = chunk(input, 2);

      // Generator created but not consumed yet
      expect(gen).toBeDefined();

      // Only when we consume it, it processes
      const first = gen.next();
      expect(first.value).toEqual([1, 2]);
      expect(first.done).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not modify the original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];

      Array.from(chunk(input, 2));

      expect(input).toEqual(original);
    });

    it('should create new arrays for each chunk', () => {
      const input = [1, 2, 3, 4];
      const result = Array.from(chunk(input, 2));

      // Modify a chunk
      result[0][0] = 999;

      // Original should be unchanged
      expect(input[0]).toBe(1);
    });
  });

  describe('performance scenarios', () => {
    it('should handle large arrays efficiently', () => {
      const input = Array.from({ length: 10000 }, (_, i) => i);
      const result = Array.from(chunk(input, 100));

      expect(result.length).toBe(100);
      expect(result[0].length).toBe(100);
      expect(result[99].length).toBe(100);
    });

    it('should handle many small chunks', () => {
      const input = Array.from({ length: 1000 }, (_, i) => i);
      const result = Array.from(chunk(input, 1));

      expect(result.length).toBe(1000);
      expect(result[0]).toEqual([0]);
      expect(result[999]).toEqual([999]);
    });
  });
});
