/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Componente/servicio Angular: conecta la pantalla con el estado local y las llamadas HTTP al Gateway.
 */
// Payload que envia el formulario de login: identificador puede ser correo o nombre de usuario.
export interface LoginRequest {
  identificador: string;
  // Contrasena enviada por formulario; backend la valida o hashea segun el flujo.
  password: string;
}
// Payload para crear usuario; debe coincidir con lo que valida register-service.
export interface RegisterRequest {
  // Nombre visible del usuario o estacionamiento.
  nombre: string;
  // Alias unico usado para iniciar sesion.
  nombreUsuario: string;
  // Correo del usuario, tambien valido como identificador de login.
  correo: string;
  // Contrasena enviada por formulario; backend la valida o hashea segun el flujo.
  password: string;
}
// Representa al usuario autenticado que queda disponible en frontend despues del login.
export interface AuthUser {
  // Identificador numerico de la fila/recurso en base de datos.
  id: number;
  // Nombre visible del usuario o estacionamiento.
  nombre?: string;
  // Alias unico usado para iniciar sesion.
  nombreUsuario?: string;
  // Correo del usuario, tambien valido como identificador de login.
  correo?: string;
  // Rol del usuario dentro del sistema.
  rol?: string;
}
// Agrupa token JWT y datos de usuario devueltos por login-service.
export interface LoginData {
  // JWT emitido por login-service y usado por el interceptor del frontend.
  token: string;
  // Datos publicos del usuario autenticado devueltos junto al token.
  user?: AuthUser;
}
// Respuesta completa del login: success/message/data viajan en JSON desde el Gateway.
export interface LoginResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Mensaje legible que el backend envia para exito o error controlado.
  message: string;
  // Contenido principal de la respuesta JSON.
  data: LoginData;
}
