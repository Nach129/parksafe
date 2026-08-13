/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CreateVehicleRequest, VehicleResponse, VehiclesResponse } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root',
})
// Servicio Angular que consulta y crea vehiculos usando el Gateway.
export class VehicleService {
  // URL base del Gateway: desde aqui el frontend no llama directo a los nodos internos.
  private readonly apiUrl = 'http://localhost:8080/api/vehicles';

  constructor(private http: HttpClient) {}

  // Consulta vehiculos del usuario actual.
  getVehicles(): Observable<VehiclesResponse> {
    // GET HTTP desde Angular: solicita datos al Gateway y recibe un Observable tipado.
    return this.http.get<VehiclesResponse>(this.apiUrl);
  }

  createVehicle(data: CreateVehicleRequest): Observable<VehicleResponse> {
    // POST HTTP desde Angular: envia un payload JSON al Gateway para crear/procesar una accion.
    return this.http.post<VehicleResponse>(this.apiUrl, data);
  }
}
