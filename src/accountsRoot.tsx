import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { routes } from './accounts/routes';

const router = createMemoryRouter(routes, {
  initialEntries: [location.hash.split('#')[1] || '/'],
});

export function AccountsRoot() {
  return <RouterProvider router={router} />;
}
