/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Componente/servicio Angular: conecta la pantalla con el estado local y las llamadas HTTP al Gateway.
 */

// Guard de autenticacion: decide si una ruta privada puede abrirse o debe volver al login.
// Usa el AuthService para revisar si existe usuario/token vigente en el frontend.

import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
