
// Tabla principal de rutas Angular: relaciona cada URL del navegador con una pantalla.
// Las rutas protegidas usan guard para exigir sesion antes de entrar a flujos privados.

import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';

import { Login } from './pages/login/login';

import { Registro } from './pages/registro/registro';

import { Inicio } from './pages/inicio/inicio';

import { Vehiculos } from './pages/vehiculos/vehiculos';

import { Estacionamiento } from './pages/estacionamiento/estacionamiento';

import { MisReservas } from './pages/mis-reservas/mis-reservas';

import { EstadoSistema } from './pages/estado-sistema/estado-sistema';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'registro',
    component: Registro,
  },

  {
    path: 'inicio',
    component: Inicio,
    canActivate: [authGuard],
  },

  {
    path: 'vehiculos',
    component: Vehiculos,
    canActivate: [authGuard],
  },

  {
    path: 'estacionamiento',
    component: Estacionamiento,
    canActivate: [authGuard],
  },

  {
    path: 'mis-reservas',
    component: MisReservas,
    canActivate: [authGuard],
  },

  {
    path: 'estado-sistema',
    component: EstadoSistema,
    canActivate: [authGuard],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
