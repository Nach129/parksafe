/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Configuracion: lee variables de entorno y define URLs/puertos usados por los procesos distribuidos.
 */

// Puerto del nodo primario: identifica el proceso que normalmente procesa reservas.
// URL del nodo respaldo: destino de la replicacion pasiva despues de cada cambio confirmado.
// Configuracion de replicacion: define timeouts e intentos para no perder operaciones ante fallas temporales.

const config = {
  port: Number(process.env.PORT || 3003),

  nodeName: process.env.NODE_NAME || "PRIMARY",
  nodeRole: process.env.NODE_ROLE || "PRIMARY",

  backupNodeUrl: process.env.BACKUP_NODE_URL || "http://localhost:3004",

  replicationTimeoutMs: Number(process.env.REPLICATION_TIMEOUT_MS || 3000),
};

module.exports = config;
