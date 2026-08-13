/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { SystemStatusResponse } from '../models/system.model';

@Injectable({
  providedIn: 'root',
})
// Servicio Angular que consume /api/system para mostrar heartbeat, nodo activo y failover.
export class SystemService {
  // URL base del Gateway: desde aqui el frontend no llama directo a los nodos internos.
  private readonly apiUrl = 'http://localhost:8080/api/system';

  constructor(private http: HttpClient) {}
  // Consulta estado desde el backend correspondiente y devuelve un Observable/JSON al consumidor.
  getStatus(): Observable<SystemStatusResponse> {
    // GET HTTP desde Angular: solicita datos al Gateway y recibe un Observable tipado.
    return this.http.get<SystemStatusResponse>(`${this.apiUrl}/status`);
  }
}
