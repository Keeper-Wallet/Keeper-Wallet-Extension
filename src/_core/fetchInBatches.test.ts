import { fetchInBatches } from './fetchInBatches';

describe('fetchInBatches', () => {
  describe('basic functionality', () => {
    it('should fetch all items in a single batch when items fit in chunk size', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await fetchInBatches(items, 10, fetchFn);

      expect(result).toEqual([2, 4, 6]);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should fetch items in multiple batches', async () => {
      const items = [1, 2, 3, 4, 5];
      const fetchFn = jest.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([2, 4, 6, 8, 10]);
      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(fetchFn).toHaveBeenNthCalledWith(1, [1, 2]);
      expect(fetchFn).toHaveBeenNthCalledWith(2, [3, 4]);
      expect(fetchFn).toHaveBeenNthCalledWith(3, [5]);
    });

    it('should handle chunk size of 1', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await fetchInBatches(items, 1, fetchFn);

      expect(result).toEqual([2, 4, 6]);
      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(fetchFn).toHaveBeenNthCalledWith(1, [1]);
      expect(fetchFn).toHaveBeenNthCalledWith(2, [2]);
      expect(fetchFn).toHaveBeenNthCalledWith(3, [3]);
    });

    it('should handle chunk size larger than array length', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await fetchInBatches(items, 100, fetchFn);

      expect(result).toEqual([2, 4, 6]);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  describe('empty and edge cases', () => {
    it('should handle empty array', async () => {
      const items: number[] = [];
      const fetchFn = jest.fn(async (batch: number[]) => batch);

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([]);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should handle single item', async () => {
      const items = [42];
      const fetchFn = jest.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await fetchInBatches(items, 5, fetchFn);

      expect(result).toEqual([84]);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn).toHaveBeenCalledWith([42]);
    });

    it('should handle uneven batch sizes', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      const fetchFn = jest.fn(async (batch: number[]) => batch.map(n => n * 2));

      const result = await fetchInBatches(items, 3, fetchFn);

      expect(result).toEqual([2, 4, 6, 8, 10, 12, 14]);
      expect(fetchFn).toHaveBeenCalledTimes(3);
      expect(fetchFn).toHaveBeenNthCalledWith(1, [1, 2, 3]);
      expect(fetchFn).toHaveBeenNthCalledWith(2, [4, 5, 6]);
      expect(fetchFn).toHaveBeenNthCalledWith(3, [7]);
    });
  });

  describe('different data types', () => {
    it('should work with strings', async () => {
      const items = ['a', 'b', 'c', 'd'];
      const fetchFn = jest.fn(async (batch: string[]) =>
        batch.map(s => s.toUpperCase()),
      );

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual(['A', 'B', 'C', 'D']);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should work with objects', async () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const fetchFn = jest.fn(async (batch: Array<{ id: number }>) =>
        batch.map(obj => ({ ...obj, processed: true })),
      );

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([
        { id: 1, processed: true },
        { id: 2, processed: true },
        { id: 3, processed: true },
      ]);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should work with mixed types', async () => {
      const items = [1, 'two', { three: 3 }];
      const fetchFn = jest.fn(async (batch: unknown[]) =>
        batch.map(item => ({ value: item })),
      );

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([
        { value: 1 },
        { value: 'two' },
        { value: { three: 3 } },
      ]);
    });
  });

  describe('async behavior', () => {
    it('should wait for each batch to complete before processing next', async () => {
      const items = [1, 2, 3, 4];
      const callOrder: number[] = [];

      const fetchFn = jest.fn(async (batch: number[]) => {
        callOrder.push(batch[0]);
        await new Promise(resolve => setTimeout(resolve, 10));
        return batch.map(n => n * 2);
      });

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([2, 4, 6, 8]);
      expect(callOrder).toEqual([1, 3]); // Sequential processing
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should handle async fetch function with delays', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async (batch: number[]) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return batch.map(n => n * 2);
      });

      const startTime = Date.now();
      const result = await fetchInBatches(items, 1, fetchFn);
      const duration = Date.now() - startTime;

      expect(result).toEqual([2, 4, 6]);
      expect(duration).toBeGreaterThanOrEqual(150); // 3 batches * 50ms
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('fetch function variations', () => {
    it('should handle fetch function that returns different length array', async () => {
      const items = [1, 2, 3, 4];
      const fetchFn = jest.fn(async (batch: number[]) => {
        // Return more items than input
        return batch.flatMap(n => [n, n * 10]);
      });

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([1, 10, 2, 20, 3, 30, 4, 40]);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch function that returns empty array', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async () => []);

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([]);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch function that filters items', async () => {
      const items = [1, 2, 3, 4, 5, 6];
      const fetchFn = jest.fn(async (batch: number[]) =>
        batch.filter(n => n % 2 === 0),
      );

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([2, 4, 6]);
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('should throw error if fetch function throws', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async () => {
        throw new Error('Fetch failed');
      });

      await expect(fetchInBatches(items, 2, fetchFn)).rejects.toThrow(
        'Fetch failed',
      );
      expect(fetchFn).toHaveBeenCalledTimes(1); // Stops at first error
    });

    it('should throw error if fetch function returns non-array', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(
        async () => 'not an array' as unknown as number[],
      );

      await expect(fetchInBatches(items, 2, fetchFn)).rejects.toThrow();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should throw error if fetch function returns null', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async () => null as unknown as number[]);

      await expect(fetchInBatches(items, 2, fetchFn)).rejects.toThrow();
    });

    it('should throw error if fetch function returns undefined', async () => {
      const items = [1, 2, 3];
      const fetchFn = jest.fn(async () => undefined as unknown as number[]);

      await expect(fetchInBatches(items, 2, fetchFn)).rejects.toThrow();
    });

    it('should stop processing on error and not call subsequent batches', async () => {
      const items = [1, 2, 3, 4, 5];
      let callCount = 0;
      const fetchFn = jest.fn(async (batch: number[]) => {
        callCount++;
        if (callCount === 2) {
          throw new Error('Second batch failed');
        }
        return batch;
      });

      await expect(fetchInBatches(items, 2, fetchFn)).rejects.toThrow(
        'Second batch failed',
      );
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('practical use cases', () => {
    it('should fetch user data in batches', async () => {
      const userIds = [1, 2, 3, 4, 5, 6, 7, 8];
      const fetchFn = jest.fn(async (ids: number[]) =>
        ids.map(id => ({ id, name: `User${id}` })),
      );

      const result = await fetchInBatches(userIds, 3, fetchFn);

      expect(result).toHaveLength(8);
      expect(result[0]).toEqual({ id: 1, name: 'User1' });
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('should fetch blockchain addresses in batches', async () => {
      const addresses = ['addr1', 'addr2', 'addr3', 'addr4', 'addr5'];
      const fetchFn = jest.fn(async (addrs: string[]) =>
        addrs.map(addr => ({ address: addr, balance: 1000 })),
      );

      const result = await fetchInBatches(addresses, 2, fetchFn);

      expect(result).toHaveLength(5);
      expect(result.every(r => r.balance === 1000)).toBe(true);
      expect(fetchFn).toHaveBeenCalledTimes(3);
    });

    it('should handle API rate limiting with batches', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const fetchFn = jest.fn(async (batch: number[]) =>
        batch.map(n => ({ id: n, data: `data${n}` })),
      );

      const result = await fetchInBatches(items, 10, fetchFn);

      expect(result).toHaveLength(100);
      expect(fetchFn).toHaveBeenCalledTimes(10);
    });
  });

  describe('performance and large datasets', () => {
    it('should handle large arrays efficiently', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => i);
      const fetchFn = jest.fn(async (batch: number[]) => batch);

      const result = await fetchInBatches(items, 50, fetchFn);

      expect(result).toHaveLength(1000);
      expect(fetchFn).toHaveBeenCalledTimes(20);
    });

    it('should maintain order of results', async () => {
      const items = [5, 3, 8, 1, 9, 2];
      const fetchFn = jest.fn(async (batch: number[]) => batch);

      const result = await fetchInBatches(items, 2, fetchFn);

      expect(result).toEqual([5, 3, 8, 1, 9, 2]);
    });
  });
});
