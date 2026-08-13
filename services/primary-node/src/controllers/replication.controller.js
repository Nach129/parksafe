/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const { pool } = require("../database");

// Implementa parte del flujo de replicacion pasiva entre primario y respaldo.
// Recibe una operacion enviada por otro nodo y la aplica de forma idempotente en la base local.
async function applyReplication(req, res, next) {
  let connection;

  try {
    const { operationId, type, content } = req.body;

    if (!operationId || !type || !content) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "operationId, type y content son obligatorios",
      });
    }

    if (type !== "ESPACIO_RESERVADO") {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: `Tipo de operación no soportado: ${type}`,
      });
    }

    if (!content.movement || !content.space) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "La operación debe contener movement y space",
      });
    }

    connection = await pool.getConnection();
    // Inicio de transaccion: agrupa lectura, bloqueo y escritura para evitar condiciones de carrera.

    await connection.beginTransaction();

    /*
     * Idempotencia.
     *
     * Si ya tenemos este operationId,
     * no se ejecuta nuevamente.
     */
    // SQL de replicacion: recupera operaciones por id/estado para aplicar idempotencia o reintentos.
    const [existingOperations] = await connection.execute(
      `
          SELECT operation_id
          FROM operaciones_replicacion
          WHERE operation_id = ?
          LIMIT 1
          FOR UPDATE
        `,
      [operationId],
    );

    if (existingOperations.length > 0) {
      // Commit: confirma atomica y definitivamente los cambios realizados dentro de la transaccion.
      await connection.commit();

      // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
      return res.status(200).json({
        success: true,

        message: "La operación ya había sido aplicada",

        alreadyApplied: true,

        operationId,

        node: "PRIMARY",
      });
    }

    const { movement, space } = content;

    /*
     * Bloqueamos el espacio antes
     * de aplicar el nuevo estado.
     */
    // SQL con FOR UPDATE: bloquea el espacio disponible elegido para que dos reservas concurrentes no tomen el mismo cupo.
    const [existingSpaces] = await connection.execute(
      `
          SELECT id
          FROM espacios
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
      [Number(space.id)],
    );

    // Si no quedan espacios disponibles, se corta la reserva para impedir sobreventa.
    if (existingSpaces.length === 0) {
      const error = new Error(
        `El espacio ${space.id} no existe en el nodo recuperado`,
      );

      error.statusCode = 409;

      throw error;
    }

    // SQL de espacio: cambia estado y vehiculo asignado dentro de la transaccion de reserva.
    await connection.execute(
      `
        UPDATE espacios
        SET
          estado = ?,
          vehiculo_id = ?
        WHERE id = ?
      `,
      [space.status, Number(space.vehicleId), Number(space.id)],
    );

    /*
     * El movimiento puede haber llegado
     * antes mediante snapshot.
     */
    // SQL de movimiento: registra historico de la reserva con operation_id para rastrear replicacion.
    const [existingMovements] = await connection.execute(
      `
          SELECT id
          FROM movimientos_estacionamiento
          WHERE operation_id = ?
          LIMIT 1
        `,
      [operationId],
    );

    if (existingMovements.length === 0) {
      // SQL de movimiento: registra historico de la reserva con operation_id para rastrear replicacion.
      await connection.execute(
        `
          INSERT INTO movimientos_estacionamiento (
            id,
            codigo,
            usuario_id,
            vehiculo_id,
            espacio_id,
            tipo,
            estado,
            nodo_procesador,
            operation_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Number(movement.id),

          movement.code,

          Number(movement.userId),

          Number(movement.vehicleId),

          Number(movement.spaceId),

          movement.type,

          movement.status,

          movement.processedBy,

          operationId,
        ],
      );
    }

    /*
     * En 3003 usamos operaciones_replicacion
     * también para dejar constancia de que
     * la operación recibida está APLICADA.
     */
    // SQL de replicacion: guarda la operacion pendiente/aplicada para tolerar fallas de red o del respaldo.
    await connection.execute(
      `
        INSERT INTO operaciones_replicacion (
          operation_id,
          tipo,
          contenido,
          estado
        )
        VALUES (?, ?, ?, 'APLICADA')
      `,
      [operationId, type, JSON.stringify(content)],
    );
    // Commit: confirma atomica y definitivamente los cambios realizados dentro de la transaccion.

    await connection.commit();

    console.log(
      `[PRIMARY/STANDBY] Operación recibida desde líder: ${operationId}`,
    );

    // 201 Created: confirma que se creo un recurso nuevo, como usuario, vehiculo o reserva.
    return res.status(201).json({
      success: true,

      message: "Operación replicada al nodo STANDBY correctamente",

      operationId,

      node: "PRIMARY",
    });
  } catch (error) {
    if (connection) {
      try {
        // Rollback: deshace cambios parciales si ocurre un error antes de confirmar la transaccion.
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "[PRIMARY] Error durante rollback:",
          rollbackError.message,
        );
      }
    }

    next(error);
  } finally {
    if (connection) {
      // Libera la conexion al pool para que otras peticiones concurrentes puedan reutilizarla.
      connection.release();
    }
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  applyReplication,
};
