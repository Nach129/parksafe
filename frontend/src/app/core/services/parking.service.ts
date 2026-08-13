/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  CreateReservationRequest,
  ParkingSpacesResponse,
  ParkingStatusResponse,
  ReservationResponse,
} from '../models/parking.model';

@Injectable({
  providedIn: 'root',
})
// Servicio Angular que consulta estacionamientos, espacios y reservas a traves del Gateway.
export class ParkingService {
  // URL base del Gateway: desde aqui el frontend no llama directo a los nodos internos.
  private readonly apiUrl = 'http://localhost:8080/api/parking';

  constructor(private http: HttpClient) {}
  // Consulta estado desde el backend correspondiente y devuelve un Observable/JSON al consumidor.
  getStatus(): Observable<ParkingStatusResponse> {
    // GET HTTP desde Angular: solicita datos al Gateway y recibe un Observable tipado.
    return this.http.get<ParkingStatusResponse>(`${this.apiUrl}/status`);
  }
  // Consulta todos los espacios para pintar disponibilidad.
  getSpaces(): Observable<ParkingSpacesResponse> {
    // GET HTTP desde Angular: solicita datos al Gateway y recibe un Observable tipado.
    return this.http.get<ParkingSpacesResponse>(`${this.apiUrl}/spaces`);
  }

  reserveSpace(data: CreateReservationRequest): Observable<ReservationResponse> {
    // POST HTTP desde Angular: envia un payload JSON al Gateway para crear/procesar una accion.
    return this.http.post<ReservationResponse>(`${this.apiUrl}/reservations`, data);
  }
  // Consulta reservas asociadas al usuario actual.
  getReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations`);
  }
}
