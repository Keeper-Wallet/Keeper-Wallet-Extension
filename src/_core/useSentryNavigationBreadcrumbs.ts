import { addBreadcrumb } from '@sentry/browser';
import { useEffect, useRef } from 'react';
import { type Location } from 'react-router-dom';

export function useSentryNavigationBreadcrumbs(location: Location) {
  const prevPageRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPage = location.pathname + location.search + location.hash;
    const prevPage = prevPageRef.current;

    if (currentPage === prevPage) {
      return;
    }

    addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      level: 'info',
      data: {
        from: prevPage,
        to: currentPage,
      },
    });

    prevPageRef.current = currentPage;
  }, [location]);
}
