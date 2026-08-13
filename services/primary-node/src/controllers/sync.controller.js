/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const { pool } = require("../database");
// Convierte fechas recibidas desde JSON/SQL a objetos Date validos o null si no vienen informadas.
function parseDate(value) {
  if (!value) {
    return new Date();
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error(`Fecha inválida recibida: ${value}`);

    error.statusCode = 400;
    throw error;
  }

  return parsedDate;
}

// Sincroniza estado completo o parcial para recuperar consistencia entre nodos.
// Reemplaza/actualiza el estado local usando un snapshot remoto para recuperar consistencia entre nodos.
async function synchronizeSnapshot(req, res, next) {
  let connection;

  try {
    const { parkings, spaces, movements, operations } = req.body;

    if (
      !Array.isArray(parkings) ||
      !Array.isArray(spaces) ||
      !Array.isArray(movements) ||
      !Array.isArray(operations)
    ) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message:
          "El snapshot debe contener parkings, spaces, movements y operations",
      });
    }

    connection = await pool.getConnection();
    // Inicio de transaccion: agrupa lectura, bloqueo y escritura para evitar condiciones de carrera.

    await connection.beginTransaction();

    /*
     * Este endpoint se utiliza para recuperar el
     * antiguo nodo primario después de un failover.
     *
     * El snapshot que llega desde el nodo actualmente
     * vigente reemplaza completamente el estado local.
     */

    // Primero eliminamos tablas dependientes.
    // SQL de replicacion: recupera operaciones por id/estado para aplicar idempotencia o reintentos.
    await connection.execute("DELETE FROM operaciones_replicacion");

    // SQL de reservas: lee movimientos para construir historial mostrado al usuario.
    await connection.execute("DELETE FROM movimientos_estacionamiento");

    // SQL parametrizado: usa placeholders (?) para separar datos del usuario de la sentencia ejecutada.
    await connection.execute("DELETE FROM espacios");

    // SQL parametrizado: usa placeholders (?) para separar datos del usuario de la sentencia ejecutada.
    await connection.execute("DELETE FROM estacionamientos");

    /*
     * 1. Restaurar estacionamientos.
     */
    for (const parking of parkings) {
      // SQL parametrizado: usa placeholders (?) para separar datos del usuario de la sentencia ejecutada.
      await connection.execute(
        `
          INSERT INTO estacionamientos (
            id,
            nombre,
            ubicacion,
            capacidad_total,
            estado,
            fecha_creacion
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          Number(parking.id),

          parking.nombre,

          parking.ubicacion || null,

          Number(parking.capacidad_total),

          parking.estado,

          parseDate(parking.fecha_creacion),
        ],
      );
    }

    /*
     * 2. Restaurar mapa de espacios.
     */
    for (const space of spaces) {
      // SQL parametrizado: usa placeholders (?) para separar datos del usuario de la sentencia ejecutada.
      await connection.execute(
        `
          INSERT INTO espacios (
            id,
            estacionamiento_id,
            codigo,
            estado,
            vehiculo_id,
            fecha_actualizacion
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          Number(space.id),

          Number(space.estacionamiento_id),

          space.codigo,

          space.estado,

          space.vehiculo_id === null || space.vehiculo_id === undefined
            ? null
            : Number(space.vehiculo_id),

          parseDate(space.fecha_actualizacion),
        ],
      );
    }

    /*
     * 3. Restaurar movimientos.
     */
    for (const movement of movements) {
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
            operation_id,
            fecha_movimiento
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Number(movement.id),

          movement.codigo,

          Number(movement.usuario_id),

          Number(movement.vehiculo_id),

          Number(movement.espacio_id),

          movement.tipo,

          movement.estado,

          movement.nodo_procesador,

          movement.operation_id,

          parseDate(movement.fecha_movimiento),
        ],
      );
    }

    /*
     * 4. Restaurar historial de operaciones.
     *
     * Las operaciones provenientes del nodo vigente
     * ya se consideran aplicadas.
     */
    for (const operation of operations) {
      const content =
        typeof operation.contenido === "string"
          ? operation.contenido
          : JSON.stringify(operation.contenido);

      // SQL de replicacion: guarda la operacion pendiente/aplicada para tolerar fallas de red o del respaldo.
      await connection.execute(
        `
          INSERT INTO operaciones_replicacion (
            operation_id,
            tipo,
            contenido,
            estado,
            fecha_creacion
          )
          VALUES (?, ?, ?, 'APLICADA', ?)
        `,
        [
          operation.operation_id,

          operation.tipo,

          content,

          operation.fecha_aplicacion
            ? parseDate(operation.fecha_aplicacion)
            : operation.fecha_creacion
              ? parseDate(operation.fecha_creacion)
              : new Date(),
        ],
      );
    }
    // Commit: confirma atomica y definitivamente los cambios realizados dentro de la transaccion.

    await connection.commit();

    console.log(
      `[PRIMARY] Snapshot de recuperación aplicado: ` +
        `${parkings.length} estacionamientos, ` +
        `${spaces.length} espacios, ` +
        `${movements.length} movimientos y ` +
        `${operations.length} operaciones`,
    );

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,

      message: "Nodo primario recuperado y sincronizado correctamente",

      data: {
        parkings: parkings.length,

        spaces: spaces.length,

        movements: movements.length,

        operations: operations.length,
      },

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
  synchronizeSnapshot,
};
