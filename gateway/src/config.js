/*
 * Gateway/API Gateway: punto de entrada unico que enruta peticiones, aplica seguridad basica y oculta al cliente si atiende el primario o el respaldo.
 * Configuracion: lee variables de entorno y define URLs/puertos usados por los procesos distribuidos.
 */

// Puerto donde escucha el Gateway; todos los clientes entran por aqui antes de llegar a microservicios.
// URLs internas de microservicios: permiten enrutar login, registro y estacionamiento sin exponerlos al frontend.
// Parametros de heartbeat: controlan cada cuanto se revisa la salud del primario y respaldo.

const config = {
  port: Number(process.env.PORT || 8080),

  services: {
    register: process.env.REGISTER_SERVICE_URL || "http://localhost:3001",

    login: process.env.LOGIN_SERVICE_URL || "http://localhost:3002",

    primary: process.env.PRIMARY_NODE_URL || "http://localhost:3003",

    backup: process.env.BACKUP_NODE_URL || "http://localhost:3004",
  },

  jwtSecret: process.env.JWT_SECRET,

  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 5000),

  heartbeat: {
    intervalMs: Number(process.env.HEARTBEAT_INTERVAL_MS || 3000),

    timeoutMs: Number(process.env.HEARTBEAT_TIMEOUT_MS || 1500),

    failureLimit: Number(process.env.HEARTBEAT_FAILURE_LIMIT || 3),
  },
};

module.exports = config;
