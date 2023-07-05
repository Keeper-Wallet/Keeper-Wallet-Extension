export function startPolling(
  ms: number,
  fn: (abortSignal: AbortSignal) => Promise<void>,
) {
  const abortController = new AbortController();
  let timeout: ReturnType<typeof setTimeout>;

  async function update() {
    try {
      await fn(abortController.signal);
    } finally {
      if (!abortController.signal.aborted) {
        timeout = setTimeout(update, ms);
      }
    }
  }

  update();

  return () => {
    clearTimeout(timeout);
    abortController.abort();
  };
}
