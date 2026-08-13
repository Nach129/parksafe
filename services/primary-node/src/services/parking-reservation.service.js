/*
 * COMENTARIOS PARKSAFE
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Servicio de dominio: contiene logica reutilizable del flujo distribuido y evita que las rutas tengan reglas de negocio.
 * Estos comentarios son explicativos para estudiar y defender el proyecto; no cambian el comportamiento del codigo.
 */

const crypto = require("crypto");

const { pool } = require("../database");

const { replicateOperation } = require("./replication.service");

const { getCurrentRole } = require("./role.service");
// Genera un codigo humano de reserva combinando timestamp y aleatoriedad para identificar el movimiento.
function generateParkingCode() {
  const timestamp = Date.now().toString().slice(-8);

  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `PARK-${timestamp}-${randomPart}`;
}
// Reserva un espacio disponible dentro de una transaccion, bloquea filas y prepara la replicacion pasiva.
async function createParkingReservation({ userId, vehicleId, parkingId }) {
  // Comprueba el rol del nodo; si no es PRIMARY no debe aceptar escrituras para evitar doble primario.
  if (getCurrentRole() !== "PRIMARY") {
    const error = new Error(
      "Este nodo se encuentra en modo STANDBY y no puede procesar reservas",
    );

    error.statusCode = 503;

    throw error;
  }

  let connection;
  let transactionCommitted = false;

  try {
    connection = await pool.getConnection();
    // Inicio de transaccion: agrupa lectura, bloqueo y escritura para evitar condiciones de carrera.

    await connection.beginTransaction();

    // SQL con FOR UPDATE: bloquea el espacio disponible elegido para que dos reservas concurrentes no tomen el mismo cupo.
    const [spaces] = await connection.execute(
      `
          SELECT
            id,
            codigo,
            estacionamiento_id,
            estado
          FROM espacios
          WHERE
            estacionamiento_id = ?
            AND estado = 'DISPONIBLE'
          ORDER BY id ASC
          LIMIT 1
          FOR UPDATE
        `,
      [parkingId],
    );

    // Si no quedan espacios disponibles, se corta la reserva para impedir sobreventa.
    if (spaces.length === 0) {
      const error = new Error(
        "No existen espacios disponibles en el estacionamiento",
      );

      error.statusCode = 409;
      throw error;
    }

    const space = spaces[0];

    // SQL con FOR UPDATE: bloquea el espacio disponible elegido para que dos reservas concurrentes no tomen el mismo cupo.
    const [existingAssignments] = await connection.execute(
      `
          SELECT id
          FROM espacios
          WHERE
            vehiculo_id = ?
            AND estado IN (
              'RESERVADO',
              'OCUPADO'
            )
          LIMIT 1
          FOR UPDATE
        `,
      [vehicleId],
    );

    // Impide que el mismo vehiculo tenga dos espacios reservados u ocupados al mismo tiempo.
    if (existingAssignments.length > 0) {
      const error = new Error("El vehículo ya posee un espacio asignado");

      error.statusCode = 409;
      throw error;
    }

    // SQL de espacio: cambia estado y vehiculo asignado dentro de la transaccion de reserva.
    await connection.execute(
      `
        UPDATE espacios
        SET
          estado = 'RESERVADO',
          vehiculo_id = ?
        WHERE id = ?
      `,
      [vehicleId, space.id],
    );

    const parkingCode = generateParkingCode();

    const operationId = crypto.randomUUID();

    // SQL de movimiento: registra historico de la reserva con operation_id para rastrear replicacion.
    const [movementResult] = await connection.execute(
      `
          INSERT INTO movimientos_estacionamiento (
            codigo,
            usuario_id,
            vehiculo_id,
            espacio_id,
            tipo,
            estado,
            nodo_procesador,
            operation_id
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            'RESERVA',
            'ACTIVO',
            'PRIMARIO',
            ?
          )
        `,
      [parkingCode, userId, vehicleId, space.id, operationId],
    );

    const replicationContent = {
      movement: {
        id: movementResult.insertId,

        code: parkingCode,

        userId,

        vehicleId,

        spaceId: space.id,

        type: "RESERVA",

        status: "ACTIVO",

        processedBy: "PRIMARIO",
      },

      space: {
        id: space.id,

        code: space.codigo,

        parkingId,

        status: "RESERVADO",

        vehicleId,
      },
    };

    // SQL de replicacion: guarda la operacion pendiente/aplicada para tolerar fallas de red o del respaldo.
    await connection.execute(
      `
        INSERT INTO operaciones_replicacion (
          operation_id,
          tipo,
          contenido,
          estado
        )
        VALUES (
          ?,
          'ESPACIO_RESERVADO',
          ?,
          'PENDIENTE'
        )
      `,
      [operationId, JSON.stringify(replicationContent)],
    );
    // Commit: confirma atomica y definitivamente los cambios realizados dentro de la transaccion.

    await connection.commit();

    transactionCommitted = true;

    const replicationResult = await replicateOperation({
      operationId,
      type: "ESPACIO_RESERVADO",
      content: replicationContent,
    });

    return {
      reservation: {
        id: movementResult.insertId,

        code: parkingCode,

        userId,

        vehicleId,

        parkingId,

        space: {
          id: space.id,

          code: space.codigo,
        },

        type: "RESERVA",

        status: "ACTIVO",

        processedBy: "PRIMARIO",

        operationId,
      },

      replication: {
        success: replicationResult.replicated,

        status: replicationResult.status,
      },
    };
  } catch (error) {
    if (connection && !transactionCommitted) {
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

    throw error;
  } finally {
    if (connection) {
      // Libera la conexion al pool para que otras peticiones concurrentes puedan reutilizarla.
      connection.release();
    }
  }
}
// Consulta las reservas activas/historicas de un usuario junto con datos del espacio y vehiculo.
async function getParkingReservationsByUser(userId) {
  // SQL de reservas: lee movimientos para construir historial mostrado al usuario.
  const [rows] = await pool.execute(
    `
        SELECT
          m.id,
          m.codigo,
          m.usuario_id,
          m.vehiculo_id,
          m.espacio_id,
          m.tipo,
          m.estado,
          m.nodo_procesador,
          m.operation_id,

          e.codigo AS espacio_codigo,
          e.estacionamiento_id,

          est.nombre AS estacionamiento_nombre

        FROM movimientos_estacionamiento m

        INNER JOIN espacios e
          ON e.id = m.espacio_id

        INNER JOIN estacionamientos est
          ON est.id = e.estacionamiento_id

        WHERE
          m.usuario_id = ?
          AND m.tipo = 'RESERVA'

        ORDER BY m.id DESC
      `,
    [userId],
  );

  return rows.map((row) => ({
    id: row.id,

    code: row.codigo,

    userId: row.usuario_id,

    vehicleId: row.vehiculo_id,

    parkingId: row.estacionamiento_id,

    parkingName: row.estacionamiento_nombre,

    space: {
      id: row.espacio_id,

      code: row.espacio_codigo,
    },

    type: row.tipo,

    status: row.estado,

    processedBy: row.nodo_procesador,

    operationId: row.operation_id,
  }));
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  createParkingReservation,
  getParkingReservationsByUser,
};
