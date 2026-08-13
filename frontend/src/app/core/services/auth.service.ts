/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
// Servicio Angular que maneja login, registro, token JWT y estado de sesion en localStorage.
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly platformId = inject(PLATFORM_ID);
  // URL base del Gateway: desde aqui el frontend no llama directo a los nodos internos.

  private readonly apiUrl = 'http://localhost:8080/api/auth';

  private readonly tokenKey = 'parksafe_token';

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        const token = response?.data?.token;

        // Si no viene token JWT, la ruta protegida no puede identificar al usuario.
        if (token && this.isBrowser()) {
          // Guarda token/usuario en localStorage para mantener la sesion entre recargas del navegador.
          localStorage.setItem(this.tokenKey, token);
        }
      }),
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  // Lee el JWT almacenado localmente para que el interceptor pueda adjuntarlo.
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  // Determina si hay token local y por tanto si el usuario puede entrar a rutas privadas.
  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false;
    }

    return !!this.getToken();
  }
  // Elimina datos de sesion local y devuelve al usuario al flujo de login.
  logout(): void {
    if (this.isBrowser()) {
      // Elimina datos de sesion local para cerrar sesion completamente en el frontend.
      localStorage.removeItem(this.tokenKey);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
