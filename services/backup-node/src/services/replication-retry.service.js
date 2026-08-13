/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

const config = require("../config");

const { pool } = require("../database");

const { replicateToStandby } = require("./replication-out.service");

const { getCurrentRole } = require("../controllers/promotion.controller");

let retryTimer = null;
let retryRunning = false;
// Busca operaciones de replicacion pendientes y las reintenta para cerrar brechas de consistencia.
async function retryPendingOperations() {
  if (retryRunning) {
    return;
  }

  /*
   * Solo el nodo que actualmente actúa
   * como PRIMARY debe replicar.
   */
  // Comprueba el rol del nodo; si no es PRIMARY no debe aceptar escrituras para evitar doble primario.
  if (getCurrentRole() !== "PRIMARY") {
    return;
  }

  retryRunning = true;

  try {
    // SQL de replicacion: recupera operaciones por id/estado para aplicar idempotencia o reintentos.
    const [operations] = await pool.execute(
      `
          SELECT
            operation_id,
            tipo,
            contenido
          FROM operaciones_replicacion
          WHERE estado = 'PENDIENTE'
          ORDER BY id ASC
          LIMIT 20
        `,
    );

    for (const operation of operations) {
      let content = operation.contenido;

      /*
       * MySQL2 puede devolver JSON
       * como objeto o como string.
       */
      if (typeof content === "string") {
        content = JSON.parse(content);
      }

      await replicateToStandby({
        operationId: operation.operation_id,

        type: operation.tipo,

        content,
      });
    }
  } catch (error) {
    console.error(
      "[BACKUP/PRIMARY] Error revisando operaciones pendientes:",
      error.message,
    );
  } finally {
    retryRunning = false;
  }
}

// Implementa parte del flujo de replicacion pasiva entre primario y respaldo.
// Arranca el proceso periodico que reintenta replicaciones fallidas.
function startReplicationRetry() {
  if (retryTimer) {
    return;
  }

  console.log(
    `[BACKUP] Reintento de replicación cada ` +
      `${config.replicationRetryIntervalMs} ms`,
  );

  retryPendingOperations();

  retryTimer = setInterval(
    retryPendingOperations,
    config.replicationRetryIntervalMs,
  );
}

// Implementa parte del flujo de replicacion pasiva entre primario y respaldo.
// Detiene el reintento periodico de replicacion al apagar el nodo.
function stopReplicationRetry() {
  if (!retryTimer) {
    return;
  }

  clearInterval(retryTimer);

  retryTimer = null;
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  startReplicationRetry,
  stopReplicationRetry,
  retryPendingOperations,
};
