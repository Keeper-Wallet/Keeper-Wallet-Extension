// Type overrides for @testing-library/webdriverio to fix compatibility with webdriverio 8.46
import type { ChainablePromiseElement } from 'webdriverio';

declare module '@testing-library/webdriverio' {
  export interface WebdriverIOQueries {
    findByText: (
      text: string,
      options?: { selector?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    findByTestId: (
      testId: string,
      options?: Record<string, unknown>,
      waitOptions?: { timeout?: number },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    findAllByTestId: (testId: string) => Promise<WebdriverIO.Element[]>;
    findByRole: (
      role: string,
      options?: { name?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    findByLabelText: (
      text: string,
      options?: { selector?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    queryByText: (
      text: string,
      options?: { selector?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element> | null;
    queryByTestId: (
      testId: string,
    ) => ChainablePromiseElement<WebdriverIO.Element> | null;
    queryAllByTestId: (testId: string) => WebdriverIO.Element[];
  }

  export interface WebdriverIOQueriesChainable {
    findByText$: (
      text: string,
      options?: { selector?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    findByTestId$: (
      testId: string,
      options?: Record<string, unknown>,
      waitOptions?: { timeout?: number },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    findAllByTestId$: (testId: string) => Promise<WebdriverIO.Element[]>;
    findByRole$: (
      role: string,
      options?: { name?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    findByLabelText$: (
      text: string,
      options?: { selector?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element>;
    queryByText$: (
      text: string,
      options?: { selector?: string },
    ) => ChainablePromiseElement<WebdriverIO.Element> | null;
    queryByTestId$: (
      testId: string,
    ) => ChainablePromiseElement<WebdriverIO.Element> | null;
    queryAllByTestId$: (testId: string) => WebdriverIO.Element[];
  }

  export interface Config {
    asyncUtilTimeout?: number;
    testIdAttribute?: string;
  }

  export function within(element: WebdriverIO.Element): WebdriverIOQueries;
  export function setupBrowser(
    browser: WebdriverIO.Browser,
  ): WebdriverIOQueries;
  export function configure(config: Partial<Config>): void;
}
