import * as Sentry from '@sentry/react';
import { useEffect, useRef } from 'react';
import { Location } from 'react-router-dom';

export function useSentryNavigationBreadcrumbs(location: Location) {
  const prevPageRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPage = location.pathname + location.search + location.hash;
    const prevPage = prevPageRef.current;

    if (currentPage === prevPage) {
      return;
    }

    Sentry.addBreadcrumb({
      type: 'navigation',
      category: 'navigation',
      level: Sentry.Severity.Info,
      data: {
        from: prevPage,
        to: currentPage,
      },
    });

    prevPageRef.current = currentPage;
  }, [location]);
}
