/*
 * Nodo respaldo: mantiene una copia sincronizada, recibe replicacion pasiva y puede ser promovido cuando falla el primario.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 */

const axios = require("axios");

const config = require("../config");

const { pool } = require("../database");

// Implementa parte del flujo de replicacion pasiva entre primario y respaldo.
// Cuando el respaldo actua como primario promovido, reenvia operaciones pendientes a un standby disponible.
async function replicateToStandby({ operationId, type, content }) {
  try {
    const response = await axios.post(
      `${config.primaryNodeUrl}/replication`,

      {
        operationId,
        type,
        content,
      },

      {
        timeout: config.replicationTimeoutMs,

        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // SQL de replicacion: actualiza estado de envio/aplicacion para saber si debe reintentarse.
    await pool.execute(
      `
        UPDATE operaciones_replicacion
        SET estado = 'APLICADA'
        WHERE operation_id = ?
      `,
      [operationId],
    );

    console.log(
      `[BACKUP/PRIMARY] Replicación hacia STANDBY confirmada: ${operationId}`,
    );

    return {
      replicated: true,
      status: "APLICADA",
      response: response.data,
    };
  } catch (error) {
    /*
     * El fallo de la réplica NO revierte
     * la reserva ya confirmada en el líder.
     */
    // SQL de replicacion: actualiza estado de envio/aplicacion para saber si debe reintentarse.
    await pool.execute(
      `
        UPDATE operaciones_replicacion
        SET estado = 'PENDIENTE'
        WHERE operation_id = ?
      `,
      [operationId],
    );

    console.warn(
      `[BACKUP/PRIMARY] STANDBY no disponible. ` +
        `Operación ${operationId} queda PENDIENTE.`,
    );

    return {
      replicated: false,
      status: "PENDIENTE",
      error: error.message,
    };
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  replicateToStandby,
};
