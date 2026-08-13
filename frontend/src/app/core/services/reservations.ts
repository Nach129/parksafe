/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

// Servicio de reservas del frontend: encapsula llamadas HTTP relacionadas con movimientos del usuario.
// Mantiene a los componentes desacoplados de las URLs exactas del Gateway.

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
// Servicio Angular sencillo para operaciones de reservas heredadas o reutilizables.
export class Reservations {}
