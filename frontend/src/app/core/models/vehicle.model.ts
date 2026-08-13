/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Componente/servicio Angular: conecta la pantalla con el estado local y las llamadas HTTP al Gateway.
 */
// Vehiculo ya registrado, usado para listar y seleccionar patente al reservar.
export interface Vehicle {
  // Identificador numerico de la fila/recurso en base de datos.
  id: number;
  // Id del usuario propietario del vehiculo o reserva.
  usuarioId?: number;
  // Patente normalizada del vehiculo; se valida para evitar duplicados.
  patente: string;
  // Marca opcional del vehiculo para mostrar informacion amigable.
  marca?: string;
  // Modelo opcional del vehiculo.
  modelo?: string;
  // Color opcional del vehiculo.
  color?: string;
}
// Payload minimo para registrar un vehiculo nuevo desde la pantalla Vehiculos.
export interface CreateVehicleRequest {
  // Patente normalizada del vehiculo; se valida para evitar duplicados.
  patente: string;
  // Marca opcional del vehiculo para mostrar informacion amigable.
  marca?: string;
  // Modelo opcional del vehiculo.
  modelo?: string;
  // Color opcional del vehiculo.
  color?: string;
}
// Respuesta al crear un vehiculo individual.
export interface VehicleResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Mensaje legible que el backend envia para exito o error controlado.
  message?: string;
  // Contenido principal de la respuesta JSON.
  data: Vehicle;
}
// Respuesta de listado de vehiculos asociados al usuario.
export interface VehiclesResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Contenido principal de la respuesta JSON.
  data: Vehicle[];
}
