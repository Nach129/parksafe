/*
 * Frontend Angular: interfaz de usuario que consume el Gateway mediante HTTP/JSON.
 * Componente/servicio Angular: conecta la pantalla con el estado local y las llamadas HTTP al Gateway.
 */
// Estado del administrador de nodos del Gateway: activo actual y si ya ocurrio failover.
export interface NodeManager {
  // Nodo logico que el Gateway considera activo para estacionamiento.
  activeNode: 'PRIMARY' | 'BACKUP';
  // URL fisica asociada al nodo activo.
  activeNodeUrl: string;
  // Indica si ya se ejecuto una conmutacion al respaldo.
  failoverExecuted: boolean;
  // Fecha/hora en que se ejecuto el failover, si ocurrio.
  failoverExecutedAt?: string | null;
}
// Estado de monitoreo de un nodo: fallos consecutivos, ultimos checks y rol reportado.
export interface HeartbeatNode {
  // Estado de la reserva o replicacion.
  status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  // Cantidad de heartbeats fallidos seguidos; al superar limite gatilla failover.
  consecutiveFailures: number;
  // Ultimo instante en que Gateway reviso el nodo.
  lastCheck?: string;
  // Ultimo heartbeat exitoso recibido desde el nodo.
  lastSuccess?: string;
  details?: {
    // Estado de la reserva o replicacion.
    status?: string;
    // Nodo que genero la respuesta cuando backend lo informa.
    node?: string;
    role?: string;
    // Fecha/hora en que se produjo el estado reportado.
    timestamp?: string;
  } | null;
}
// Respuesta usada por la pantalla Estado Sistema para mostrar Gateway, nodos y heartbeat.
export interface SystemStatusResponse {
  // Bandera comun que indica si la operacion HTTP fue exitosa a nivel de negocio.
  success: boolean;

  gateway: {
    // Estado de la reserva o replicacion.
    status: string;
    // Fecha/hora en que se produjo el estado reportado.
    timestamp: string;
  };

  // Resumen del administrador de nodo activo del Gateway.
  nodeManager: NodeManager;

  heartbeat: {
    // Indica si el ciclo automatico de heartbeat esta activo.
    running: boolean;
    // Estado de heartbeat del nodo primario fisico.
    primary: HeartbeatNode;
    // Estado de heartbeat del nodo respaldo fisico.
    backup: HeartbeatNode;
  };

  // Listado opcional de salud de microservicios base.
  services?: unknown[];
}
