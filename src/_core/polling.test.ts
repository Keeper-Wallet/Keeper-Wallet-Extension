import { startPolling } from './polling';

describe('startPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const createMockFn = () => jest.fn(async () => {});

  const advanceTime = async (ms: number) => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  };

  const startAndWait = async (
    ms: number,
    fn: (signal: AbortSignal) => Promise<void>,
  ) => {
    const stop = startPolling(ms, fn);
    await Promise.resolve();
    return stop;
  };

  describe('basic functionality', () => {
    it('should call function immediately on start', async () => {
      const fn = createMockFn();
      await startAndWait(1000, fn);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function repeatedly at specified interval', async () => {
      const fn = createMockFn();
      await startAndWait(1000, fn);

      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(1000);
      expect(fn).toHaveBeenCalledTimes(2);

      await advanceTime(1000);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should pass AbortSignal to function', async () => {
      const fn = jest.fn(async (signal: AbortSignal) => {
        expect(signal).toBeInstanceOf(AbortSignal);
        expect(signal.aborted).toBe(false);
      });

      await startAndWait(1000, fn);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should return a stop function', () => {
      const fn = createMockFn();
      const stop = startPolling(1000, fn);

      expect(typeof stop).toBe('function');
    });
  });

  describe('stopping polling', () => {
    it('should stop polling when stop function is called', async () => {
      const fn = createMockFn();
      const stop = await startAndWait(1000, fn);

      expect(fn).toHaveBeenCalledTimes(1);
      stop();

      await advanceTime(5000);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should abort the signal when stopped', async () => {
      let capturedSignal: AbortSignal | null = null;
      const fn = jest.fn(async (signal: AbortSignal) => {
        capturedSignal = signal;
      });

      const stop = await startAndWait(1000, fn);
      expect(capturedSignal).not.toBeNull();

      const signal = capturedSignal as unknown as AbortSignal;
      expect(signal.aborted).toBe(false);

      stop();
      expect(signal.aborted).toBe(true);
    });

    it('should clear timeout when stopped', async () => {
      const fn = createMockFn();
      const stop = await startAndWait(1000, fn);

      expect(fn).toHaveBeenCalledTimes(1);
      stop();

      await advanceTime(10000);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should be safe to call stop multiple times', async () => {
      const fn = createMockFn();
      const stop = await startAndWait(1000, fn);

      expect(() => {
        stop();
        stop();
        stop();
      }).not.toThrow();
    });
  });

  describe('different intervals', () => {
    it('should work with short intervals', async () => {
      const fn = createMockFn();
      await startAndWait(100, fn);

      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(100);
      expect(fn).toHaveBeenCalledTimes(2);

      await advanceTime(100);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should work with long intervals', async () => {
      const fn = createMockFn();
      await startAndWait(60000, fn);

      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(60000);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should work with very short intervals', async () => {
      const fn = createMockFn();
      await startAndWait(1, fn);

      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(1);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('async function handling', () => {
    it('should wait for async function to complete before scheduling next call', async () => {
      let resolvePromise: (() => void) | undefined;
      const fn = jest.fn(async () => {
        await new Promise<void>(resolve => {
          resolvePromise = resolve;
        });
      });

      await startAndWait(1000, fn);
      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(1000);
      expect(fn).toHaveBeenCalledTimes(1);

      if (resolvePromise) {
        resolvePromise();
      }
      await Promise.resolve();
      await Promise.resolve();

      await advanceTime(1000);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle function that resolves immediately', async () => {
      const fn = createMockFn();
      await startAndWait(1000, fn);

      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(1000);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should not schedule next call if stopped', async () => {
      const fn = createMockFn();
      const stop = await startAndWait(1000, fn);

      expect(fn).toHaveBeenCalledTimes(1);
      stop();

      await advanceTime(5000);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('abort signal usage', () => {
    it('should allow function to check abort signal', async () => {
      const fn = jest.fn(async (signal: AbortSignal) => {
        if (signal.aborted) {
          throw new Error('Aborted');
        }
      });

      const stop = await startAndWait(1000, fn);
      expect(fn).toHaveBeenCalledTimes(1);

      stop();

      await advanceTime(1000);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should provide same signal instance across calls', async () => {
      const signals: AbortSignal[] = [];
      const fn = jest.fn(async (signal: AbortSignal) => {
        signals.push(signal);
      });

      await startAndWait(1000, fn);
      await advanceTime(1000);
      await advanceTime(1000);

      expect(signals.length).toBe(3);
      expect(signals[0]).toBe(signals[1]);
      expect(signals[1]).toBe(signals[2]);
    });
  });

  describe('practical use cases', () => {
    it('should poll API endpoint repeatedly', async () => {
      const apiCall = createMockFn();
      await startAndWait(5000, apiCall);

      expect(apiCall).toHaveBeenCalledTimes(1);

      await advanceTime(5000);
      expect(apiCall).toHaveBeenCalledTimes(2);

      await advanceTime(5000);
      expect(apiCall).toHaveBeenCalledTimes(3);
    });

    it('should check blockchain transaction status', async () => {
      let txStatus = 'pending';
      const checkTx = jest.fn(async (signal: AbortSignal) => {
        if (signal.aborted) return;
        if (txStatus === 'confirmed') {
          // Would stop polling in real code
        }
      });

      const stop = await startAndWait(3000, checkTx);
      expect(checkTx).toHaveBeenCalledTimes(1);

      await advanceTime(3000);
      expect(checkTx).toHaveBeenCalledTimes(2);

      txStatus = 'confirmed';
      stop();

      await advanceTime(3000);
      expect(checkTx).toHaveBeenCalledTimes(2);
    });

    it('should refresh data periodically', async () => {
      let dataVersion = 0;
      const refreshData = jest.fn(async () => {
        dataVersion++;
      });

      await startAndWait(2000, refreshData);
      expect(dataVersion).toBe(1);

      await advanceTime(2000);
      expect(dataVersion).toBe(2);

      await advanceTime(2000);
      expect(dataVersion).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle zero interval', async () => {
      const fn = createMockFn();
      await startAndWait(0, fn);

      expect(fn).toHaveBeenCalledTimes(1);

      await advanceTime(0);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle stopping before first call completes', async () => {
      let resolvePromise: (() => void) | undefined;
      const fn = jest.fn(async () => {
        await new Promise<void>(resolve => {
          resolvePromise = resolve;
        });
      });

      const stop = await startAndWait(1000, fn);
      expect(fn).toHaveBeenCalledTimes(1);

      stop();

      if (resolvePromise) {
        resolvePromise();
      }
      await Promise.resolve();

      await advanceTime(5000);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
