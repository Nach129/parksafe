/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Componente/servicio Angular: conecta la pantalla con el estado local y las llamadas HTTP al Gateway.
 */

// Interceptor HTTP: agrega el token JWT a cada peticion saliente cuando existe sesion.
// Esto permite que el Gateway identifique al usuario sin pedir credenciales en cada llamada.

import { PLATFORM_ID, inject } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('parksafe_token');

  // Si no viene token JWT, la ruta protegida no puede identificar al usuario.
  if (!token) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
