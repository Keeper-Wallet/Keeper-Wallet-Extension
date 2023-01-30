export const Windows = {
  captureNewWindows: async () => {
    const prevHandlesSet = new Set(await browser.getWindowHandles());

    return {
      waitForNewWindows: async (count: number, timeout = 5000) => {
        let newHandles: string[] = [];

        await browser.waitUntil(
          async () => {
            const handles = await browser.getWindowHandles();

            newHandles = handles.filter(handle => !prevHandlesSet.has(handle));

            return newHandles.length >= count;
          },
          {
            timeoutMsg: 'waiting for new windows to appear',
            timeout,
          }
        );

        return newHandles;
      },
    };
  },

  waitForWindowToClose: async (handle: string) => {
    await browser.waitUntil(
      async () => {
        const handles = await browser.getWindowHandles();

        return !handles.includes(handle);
      },
      {
        timeoutMsg: 'waiting for window to close',
      }
    );
  },
};
