import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { routes } from './ui/routes';

const router = createMemoryRouter(routes);

export function PopupRoot() {
  return <RouterProvider router={router} />;
}
