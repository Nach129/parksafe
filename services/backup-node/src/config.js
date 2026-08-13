/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Configuracion: lee variables de entorno y define URLs/puertos usados por los procesos distribuidos.
 */

// Puerto del nodo respaldo: permite recibir replicacion y atender trafico si es promovido.
// URL del primario original: se usa para sincronizacion o referencia en escenarios de failover.
// Configuracion de promocion/replicacion: apoya la tolerancia a fallas exigida por la pauta.

const config = {
  port: Number(process.env.PORT || 3004),

  nodeName: process.env.NODE_NAME || "BACKUP",

  nodeRole: process.env.NODE_ROLE || "BACKUP",

  database: {
    host: process.env.DB_HOST || "localhost",

    port: Number(process.env.DB_PORT || 3308),

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    name: process.env.DB_NAME || "parksafe_backup",
  },

  primaryNodeUrl: process.env.PRIMARY_NODE_URL || "http://localhost:3003",

  replicationTimeoutMs: Number(process.env.REPLICATION_TIMEOUT_MS || 3000),

  replicationRetryIntervalMs: Number(
    process.env.REPLICATION_RETRY_INTERVAL_MS || 5000,
  ),
};

module.exports = config;
