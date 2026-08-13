/*
 * Nodo primario: concentra la logica de estacionamiento, aplica transacciones para concurrencia y replica cambios al nodo respaldo.
 * Controlador HTTP: recibe la solicitud, llama a la capa de servicio/base de datos y devuelve una respuesta JSON.
 */

const { pool } = require("../database");
// Calcula resumen de capacidad por estacionamiento contando espacios disponibles, reservados y ocupados.
async function getParkingStatus(req, res, next) {
  try {
    // SQL parametrizado: usa placeholders (?) para separar datos del usuario de la sentencia ejecutada.
    const [parkingRows] = await pool.execute(`
      SELECT
        e.id,
        e.nombre,
        e.ubicacion,
        e.capacidad_total,
        e.estado,

        COUNT(es.id) AS espacios_totales,

        SUM(
          CASE
            WHEN es.estado = 'DISPONIBLE'
            THEN 1
            ELSE 0
          END
        ) AS espacios_disponibles,

        SUM(
          CASE
            WHEN es.estado = 'RESERVADO'
            THEN 1
            ELSE 0
          END
        ) AS espacios_reservados,

        SUM(
          CASE
            WHEN es.estado = 'OCUPADO'
            THEN 1
            ELSE 0
          END
        ) AS espacios_ocupados,

        SUM(
          CASE
            WHEN es.estado = 'FUERA_DE_SERVICIO'
            THEN 1
            ELSE 0
          END
        ) AS espacios_fuera_servicio

      FROM estacionamientos e

      LEFT JOIN espacios es
        ON es.estacionamiento_id = e.id

      GROUP BY
        e.id,
        e.nombre,
        e.ubicacion,
        e.capacidad_total,
        e.estado
    `);

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      data: parkingRows,
      node: "PRIMARY",
    });
  } catch (error) {
    next(error);
  }
}
// Lista los espacios fisicos de estacionamiento con su estado actual para pintar el mapa en frontend.
async function getParkingSpaces(req, res, next) {
  try {
    // SQL de espacios: lee disponibilidad/estado fisico que luego se muestra o valida.
    const [spaces] = await pool.execute(`
      SELECT
        id,
        estacionamiento_id,
        codigo,
        estado,
        vehiculo_id,
        fecha_actualizacion
      FROM espacios
      ORDER BY id ASC
    `);

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      data: spaces,
      node: "PRIMARY",
    });
  } catch (error) {
    next(error);
  }
}
// Busca un espacio puntual por id y devuelve error 404 si no existe.
async function getParkingSpaceById(req, res, next) {
  try {
    const spaceId = Number(req.params.id);

    if (!Number.isInteger(spaceId) || spaceId <= 0) {
      // 400 Bad Request: corta el flujo porque el cliente envio datos incompletos o invalidos.
      return res.status(400).json({
        success: false,
        message: "Identificador de espacio inválido",
      });
    }

    // SQL de espacios: lee disponibilidad/estado fisico que luego se muestra o valida.
    const [spaces] = await pool.execute(
      `
        SELECT
          id,
          estacionamiento_id,
          codigo,
          estado,
          vehiculo_id,
          fecha_actualizacion
        FROM espacios
        WHERE id = ?
        LIMIT 1
      `,
      [spaceId],
    );

    // Si no quedan espacios disponibles, se corta la reserva para impedir sobreventa.
    if (spaces.length === 0) {
      // 404 Not Found: informa que el recurso solicitado no existe en la base local.
      return res.status(404).json({
        success: false,
        message: "Espacio de estacionamiento no encontrado",
      });
    }

    // 200 OK: confirma lectura o accion exitosa y devuelve datos JSON al consumidor.
    return res.status(200).json({
      success: true,
      data: spaces[0],
      node: "PRIMARY",
    });
  } catch (error) {
    next(error);
  }
}
// Exporta las funciones publicas del modulo para que rutas, servidor u otros servicios puedan reutilizarlas.

module.exports = {
  getParkingStatus,
  getParkingSpaces,
  getParkingSpaceById,
};
