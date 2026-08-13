/*
 * COMENTARIOS PARKSAFE
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 * Estos comentarios son explicativos para estudiar y defender el proyecto; no cambian el comportamiento del codigo.
 */

const axios = require("axios");

const config = require("../config");
const { pool } = require("../database");

// Implementa parte del flujo de replicacion pasiva entre primario y respaldo.
// Envia al respaldo una operacion ya confirmada por el primario y actualiza su estado de replicacion.
async function replicateOperation({ operationId, type, content }) {
  try {
    const response = await axios.post(
      `${config.backupNodeUrl}/replication`,
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

    console.log(`[PRIMARY] Replicación ParkSafe confirmada: ${operationId}`);

    return {
      replicated: true,
      status: "APLICADA",
      response: response.data,
    };
  } catch (error) {
    console.error(
      `[PRIMARY] No fue posible replicar ${operationId}: ${error.message}`,
    );

    // SQL de replicacion: actualiza estado de envio/aplicacion para saber si debe reintentarse.
    await pool.execute(
      `
        UPDATE operaciones_replicacion
        SET estado = 'PENDIENTE'
        WHERE operation_id = ?
      `,
      [operationId],
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
  replicateOperation,
};
