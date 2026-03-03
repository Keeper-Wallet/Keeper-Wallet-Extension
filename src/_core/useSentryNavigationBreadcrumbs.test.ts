/**
 * @jest-environment jsdom
 */
import { addBreadcrumb } from '@sentry/browser';
import { renderHook } from '@testing-library/react';
import type { Location } from 'react-router-dom';

import { useSentryNavigationBreadcrumbs } from './useSentryNavigationBreadcrumbs';

jest.mock('@sentry/browser', () => ({
  addBreadcrumb: jest.fn(),
}));

const mockAddBreadcrumb = addBreadcrumb as jest.Mock;

function makeLocation(pathname: string, search = '', hash = ''): Location {
  return { pathname, search, hash, state: null, key: 'default' };
}

describe('useSentryNavigationBreadcrumbs', () => {
  beforeEach(() => {
    mockAddBreadcrumb.mockClear();
  });

  it('adds a breadcrumb with null "from" on initial render', () => {
    renderHook(() => useSentryNavigationBreadcrumbs(makeLocation('/home')));

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(1);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      type: 'navigation',
      category: 'navigation',
      level: 'info',
      data: { from: null, to: '/home' },
    });
  });

  it('adds a breadcrumb with correct "from" and "to" when location changes', () => {
    const { rerender } = renderHook(
      ({ location }) => useSentryNavigationBreadcrumbs(location),
      { initialProps: { location: makeLocation('/home') } },
    );

    rerender({ location: makeLocation('/settings') });

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(2);
    expect(mockAddBreadcrumb).toHaveBeenLastCalledWith({
      type: 'navigation',
      category: 'navigation',
      level: 'info',
      data: { from: '/home', to: '/settings' },
    });
  });

  it('does not add a duplicate breadcrumb when location reference changes but path is the same', () => {
    const { rerender } = renderHook(
      ({ location }) => useSentryNavigationBreadcrumbs(location),
      { initialProps: { location: makeLocation('/home') } },
    );

    rerender({ location: makeLocation('/home') });

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(1);
  });

  it('includes search and hash in the page path', () => {
    renderHook(() =>
      useSentryNavigationBreadcrumbs(
        makeLocation('/search', '?q=hello', '#section'),
      ),
    );

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      type: 'navigation',
      category: 'navigation',
      level: 'info',
      data: { from: null, to: '/search?q=hello#section' },
    });
  });

  it('tracks "from" correctly across multiple navigations', () => {
    const { rerender } = renderHook(
      ({ location }) => useSentryNavigationBreadcrumbs(location),
      { initialProps: { location: makeLocation('/page1') } },
    );

    rerender({ location: makeLocation('/page2') });
    rerender({ location: makeLocation('/page3') });

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(3);
    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: { from: '/page1', to: '/page2' } }),
    );
    expect(mockAddBreadcrumb).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ data: { from: '/page2', to: '/page3' } }),
    );
  });
});
