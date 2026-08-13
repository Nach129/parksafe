/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Componente/servicio Angular: conecta la pantalla con el estado local y las llamadas HTTP al Gateway.
 */

// ParkingSpaceStatus: tipo enumerado que limita los valores permitidos y evita estados visuales invalidos.
export type ParkingSpaceStatus = 'DISPONIBLE' | 'RESERVADO' | 'OCUPADO' | 'FUERA_DE_SERVICIO';
// Resumen de un estacionamiento y sus contadores de disponibilidad.
export interface Parking {
  // Identificador numerico de la fila/recurso en base de datos.
  id: number;
  // Nombre visible del usuario o estacionamiento.
  nombre: string;
  // Texto descriptivo de donde esta el estacionamiento.
  ubicacion?: string;
  // Capacidad maxima declarada para el estacionamiento.
  capacidad_total: number;
  // Total de espacios calculados/asociados al estacionamiento.
  espacios_totales?: number;
  // Cantidad de cupos libres que aun pueden reservarse.
  espacios_disponibles?: number;
  // Cantidad de cupos reservados pero no necesariamente ocupados.
  espacios_reservados?: number;
  // Cantidad de cupos ocupados fisicamente.
  espacios_ocupados?: number;
  // Cantidad de cupos bloqueados o no utilizables.
  espacios_fuera_servicio?: number;
  // Estado actual del recurso: activo, disponible, reservado, ocupado, etc.
  estado?: string;
}
// Espacio fisico individual con estado y vehiculo asignado si corresponde.
export interface ParkingSpace {
  // Identificador numerico de la fila/recurso en base de datos.
  id: number;
  // Id del estacionamiento al que pertenece el espacio.
  estacionamiento_id: number;
  // Codigo humano del espacio o movimiento, usado para mostrarlo al usuario.
  codigo: string;
  // Estado actual del recurso: activo, disponible, reservado, ocupado, etc.
  estado: ParkingSpaceStatus;
  // Vehiculo asociado al espacio; null cuando el cupo esta libre.
  vehiculo_id: number | null;
  // Timestamp del ultimo cambio de estado del espacio.
  fecha_actualizacion?: string;
}
// Respuesta del endpoint de estado de estacionamientos, incluyendo nodo que atendio si viene del Gateway.
export interface ParkingStatusResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Contenido principal de la respuesta JSON.
  data: Parking[];
  // Nodo que genero la respuesta cuando backend lo informa.
  node?: string;
  // Nodo al que el Gateway redirigio la peticion; clave para demostrar failover transparente.
  routedByGatewayTo?: string;
}
// Respuesta del endpoint que entrega el mapa/lista de espacios.
export interface ParkingSpacesResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Contenido principal de la respuesta JSON.
  data: ParkingSpace[];
  // Nodo que genero la respuesta cuando backend lo informa.
  node?: string;
  // Nodo al que el Gateway redirigio la peticion; clave para demostrar failover transparente.
  routedByGatewayTo?: string;
}
// Payload de reserva: vehiculo y estacionamiento que el nodo activo debe procesar.
export interface CreateReservationRequest {
  // Id del vehiculo seleccionado por el usuario para crear la reserva.
  vehiculoId: number;
  // Id del estacionamiento donde se intentara reservar.
  estacionamientoId: number;
}
// Movimiento de reserva confirmado, con codigo, espacio y operationId para replicacion.
export interface Reservation {
  // Identificador numerico de la fila/recurso en base de datos.
  id: number;
  // Codigo de reserva mostrado al usuario y guardado en movimientos.
  code: string;
  // Id del usuario asociado al movimiento/reserva.
  userId: number;
  // Id del vehiculo asociado al movimiento/reserva.
  vehicleId: number;
  // Id del estacionamiento asociado a la reserva.
  parkingId: number;

  space: {
    // Identificador numerico de la fila/recurso en base de datos.
    id: number;
    // Codigo de reserva mostrado al usuario y guardado en movimientos.
    code: string;
  };

  // Tipo de movimiento, por ejemplo RESERVA.
  type: string;
  // Estado de la reserva o replicacion.
  status: string;
  // Nodo que proceso originalmente la reserva.
  processedBy: string;
  // UUID que identifica la operacion para replicacion idempotente.
  operationId: string;
}
// Resultado de enviar la operacion al respaldo: aplicada o pendiente.
export interface ReplicationResult {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Estado de la reserva o replicacion.
  status: 'APLICADA' | 'PENDIENTE';
}
// Respuesta completa al reservar, incluyendo datos de replicacion y nodo procesador.
export interface ReservationResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;
  // Mensaje legible que el backend envia para exito o error controlado.
  message: string;
  // Contenido principal de la respuesta JSON.
  data: Reservation;
  // Resultado de replicar la reserva hacia el respaldo.
  replication?: ReplicationResult;
  // Nodo que genero la respuesta cuando backend lo informa.
  node: string;
  // Rol activo reportado por el nodo que respondio.
  activeRole?: string;
  // Nodo al que el Gateway redirigio la peticion; clave para demostrar failover transparente.
  routedByGatewayTo?: string;
}
