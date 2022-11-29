import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { routes } from './popup/routes';

const router = createMemoryRouter(routes);

export function PopupRoot() {
  return <RouterProvider router={router} />;
}
