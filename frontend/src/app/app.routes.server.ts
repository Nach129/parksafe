

// Rutas de servidor para Angular SSR; complementan las rutas del cliente durante el build.
// Aqui no se define negocio, solo como se prerenderizan o sirven vistas.

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
